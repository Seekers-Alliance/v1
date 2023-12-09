// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IHierarchicalDrawing.sol";

// This contract uses Chainlink products: CCIP and Price Feed
// First, Chainlink Price Feed is used to obtain the current exchange rates between supported tokens, 
// allowing players to use the token of their choice when purchasing our card packs.
// Second, we deployed our main contracts on the Avalanche Fuji testnet, 
// then, we applied Chainlink CCIP to make it convenient for players 
// from other supported chains to be able to make cross-chain purchases.

event PackPurchased(address indexed buyer, uint32 amount);
event MessageSent(
    bytes32 indexed messageId, // The unique ID of the CCIP message.
    uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
    address indexed messageSender // The address of the sender on the source chain.
);

contract MarketplaceSender is OwnerIsCreator {
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector); // Used when the destination chain has not been allowlisted by the contract owner.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Native token fails.

    enum PayFeesIn {
        Native,
        LINK
    }

    address immutable i_router;
    address immutable i_link;
    address public nativeTokenAggregator;
    address public basePaymentToken;

    // Mapping to keep track of allowlisted destination chains.
    mapping(uint64 => bool) public allowlistedDestinationChains;
    mapping(uint32 => uint256) public packsPrice;
    mapping(address => address) public aggregators;

    constructor(
        address _basePaymentToken,
        address _baseAggregator,
        address _nativeAggregator,
        address router,
        address link
    ) {
        i_router = router;
        i_link = link;
        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);
        basePaymentToken = _basePaymentToken;
        aggregators[_basePaymentToken] = _baseAggregator;
        nativeTokenAggregator = _nativeAggregator;
    }

    /// @dev Modifier that checks if the chain with the given destinationChainSelector is allowlisted.
    /// @param _destinationChainSelector The selector of the destination chain.
    modifier onlyAllowlistedDestinationChain(uint64 _destinationChainSelector) {
        if (!allowlistedDestinationChains[_destinationChainSelector])
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }

    /// @dev Updates the allowlist status of a destination chain for transactions.
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = allowed;
    }

    function setNativeAggregator(address _aggregator) public onlyOwner {
        nativeTokenAggregator = _aggregator;
    }

    function setAggregator(address _token, address _aggregator) public onlyOwner {
        aggregators[_token] = _aggregator;
    }

    // @dev Function to set the pack price 
    function setPackPrice(uint32 _packID, uint256 _packPrice) external onlyOwner {
        packsPrice[_packID] = _packPrice;
    }
    
    function priceConvertor(
        address _numeratorAggregator,
        address _denominatorAggregator,
        uint8 _decimals
    ) public view returns (int256) {
        require(
            _decimals > uint8(0) && _decimals <= uint8(18),
            "Invalid _decimals"
        );

        AggregatorV3Interface numeratorAggregator = AggregatorV3Interface(_numeratorAggregator);
        AggregatorV3Interface denominatorAggregator = AggregatorV3Interface(_denominatorAggregator);

        int256 decimals = int256(10 ** uint256(_decimals));
        (, int256 payPrice, , , ) = numeratorAggregator.latestRoundData();
        uint8 payDecimals = numeratorAggregator.decimals();
        payPrice = scalePrice(payPrice, payDecimals, _decimals);

        (, int256 basePrice, , , ) = denominatorAggregator.latestRoundData();
        uint8 baseDecimals = denominatorAggregator.decimals();
        basePrice = scalePrice(basePrice, baseDecimals, _decimals);

        return (payPrice * decimals) / basePrice;
    }

    function scalePrice(
        int256 _price,
        uint8 _priceDecimals,
        uint8 _decimals
    ) internal pure returns (int256) {
        if (_priceDecimals < _decimals) {
            return _price * int256(10 ** uint256(_decimals - _priceDecimals));
        } else if (_priceDecimals > _decimals) {
            return _price / int256(10 ** uint256(_priceDecimals - _decimals));
        }
        return _price;
    }

    function getPriceFeed(address _aggregator) public view returns(int256) {
        (, int256 price, , , ) = AggregatorV3Interface(_aggregator).latestRoundData();
        return (price);
    }

    function getPackConvertedPrice(uint32 _packID, address _token) public view returns(uint256) {
        ERC20 token = ERC20(_token);
        ERC20 baseToken = ERC20(basePaymentToken);

        uint256 convertedPrice = uint256(priceConvertor(aggregators[basePaymentToken], aggregators[_token], 18));
        uint256 totalPayment = packsPrice[_packID]*convertedPrice / 10**(baseToken.decimals() + 18 - token.decimals());

        return (totalPayment);
    }

    function getPackConvertedNativePrice(uint32 _packID) public view returns(uint256) {
        ERC20 baseToken = ERC20(basePaymentToken);
        uint256 convertedPrice = uint256(priceConvertor(aggregators[basePaymentToken], nativeTokenAggregator, 18));
        uint256 totalPayment = packsPrice[_packID]*convertedPrice / 10**baseToken.decimals();

        return (totalPayment);
    }

    /// @notice Sends data to receiver on the destination chain.
    /// @dev Assumes your contract has sufficient LINK.
    /// @param destinationChainSelector The identifier (aka selector) for the destination blockchain.
    /// @param messageReceiver The address of the recipient on the destination blockchain.
    function sendPurchasedMessage(
        uint64 destinationChainSelector,
        address messageReceiver,
        uint32 _packID, 
        uint32 _packAmounts,
        PayFeesIn payFeesIn
    ) internal {
        // CCIP send message to dest contract to set user drawable amount
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(messageReceiver),
            data: abi.encodeWithSignature("setPurchasedInfo(address,uint32,uint32)", msg.sender, _packID, _packAmounts),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: payFeesIn == PayFeesIn.LINK ? i_link : address(0)
        });

        uint256 fee = IRouterClient(i_router).getFee(
            destinationChainSelector,
            message
        );

        bytes32 messageId;

        if (payFeesIn == PayFeesIn.LINK) {
            messageId = IRouterClient(i_router).ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            messageId = IRouterClient(i_router).ccipSend{value: fee}(
                destinationChainSelector,
                message
            );
        }
        
        emit MessageSent(messageId, destinationChainSelector, msg.sender);
    }

    // Function to purchase a game pack
    function purchasePack(
        uint64 destinationChainSelector,
        address messageReceiver,
        address _paymentToken,
        uint32 _packID, 
        uint32 _packAmounts,
        PayFeesIn payFeesIn
    ) external {
        require(_packAmounts > 0, "Pack amount must be greater than 0");
        require(aggregators[_paymentToken] != address(0), "Token not supported");
        uint256 totalPayment;
        address buyer = msg.sender;
        ERC20 token = ERC20(_paymentToken);

        totalPayment = _packAmounts*packsPrice[_packID];

        // Check if the buyer has enough allowance and balance
        require(
            token.allowance(buyer, address(this)) >= totalPayment,
            "Insufficient allowance"
        );
        require(
            token.balanceOf(buyer) >= totalPayment,
            "Insufficient balance"
        );

        // Transfer tokens from buyer to contract
        require(
            token.transferFrom(buyer, address(this), totalPayment),
            "Token transfer failed"
        );

        sendPurchasedMessage(destinationChainSelector, messageReceiver, _packID, _packAmounts, payFeesIn);
        emit PackPurchased(buyer, _packAmounts);
    }

    function purchasePackNative(
        uint64 destinationChainSelector,
        address messageReceiver,
        uint32 _packID, 
        uint32 _packAmounts,
        PayFeesIn payFeesIn
    ) external payable {
        require(_packAmounts > 0, "Pack amount must be greater than 0");
        address buyer = msg.sender;
        uint256 packConvertedPrice = getPackConvertedNativePrice(_packID);
        uint256 totalPayment = _packAmounts*packConvertedPrice;

        // Check if the buyer has enough balance
        require(
            msg.value == totalPayment,
            "Incorrect amount"
        );

        require(
            buyer.balance >= totalPayment,
            "Insufficient amount"
        );

        sendPurchasedMessage(destinationChainSelector, messageReceiver, _packID, _packAmounts, payFeesIn);
        emit PackPurchased(buyer, _packAmounts);
    }

    // Function for the owner to withdraw funds from the contract
    function withdrawFunds(address _token, uint256 _amount) external onlyOwner {
        ERC20 withdrawToken = ERC20(_token);
        require(
            withdrawToken.balanceOf(address(this)) >= _amount,
            "Insufficient contract balance"
        );

        // Transfer funds to the owner
        require(
            withdrawToken.transfer(owner(), _amount),
            "Token transfer failed"
        );
    }

    // Function to withdraw Native from the contract (only owner)
    function withdrawNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
