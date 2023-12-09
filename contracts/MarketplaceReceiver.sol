// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IHierarchicalDrawing.sol";

// This contract uses Chainlink products: CCIP and Price Feed
// First, Chainlink Price Feed is used to obtain the current exchange rates between tokens, 
// allowing players to use a supported token of their choice when purchasing our card packs.
// Second, we deployed our main contracts on the Avalanche Fuji testnet, 
// then, we applied Chainlink CCIP to make it convenient for players 
// from other chains to be able to make cross-chain purchases.

contract MarketplaceReceiver is CCIPReceiver, OwnerIsCreator {
    error SourceChainNotAllowlisted(uint64 sourceChainSelector);
    error SenderNotAllowlisted(address sender);
    error CallerNotAllowed(address caller);

    event PackPurchased(address indexed buyer, uint32 amount);

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector // The chain selector of the source chain.
    );

    struct PackInfo {
        uint256 basePrice;
        uint32[] poolsID;
        uint32[] amounts;
    }

    // Mapping to keep track of allowlisted source chains.
    mapping(uint64 => bool) public allowlistedSourceChains;
    // Mapping to keep track of allowlisted senders.
    mapping(address => bool) public allowlistedSenders;
    mapping (address => uint256) public totalAmount;
    mapping (uint32 => PackInfo) public packsInfo;
    mapping(address => address) public aggregators;

    address public nativeTokenAggregator;
    address public basePaymentToken;
    IHierarchicalDrawing public drawContract;
    
    constructor(
        address _ccipRouter,
        address _basePaymentToken,
        address _baseAggregator,
        address _nativeAggregator
    ) CCIPReceiver(_ccipRouter){
        basePaymentToken = _basePaymentToken;
        aggregators[_basePaymentToken] = _baseAggregator;
        nativeTokenAggregator = _nativeAggregator;
    }

    function setAggregator(address _token, address _aggregator) public onlyOwner {
        aggregators[_token] = _aggregator;
    }

    function setNativeAggregator(address _aggregator) public onlyOwner {
        nativeTokenAggregator = _aggregator;
    }
    
    function setDrawContract(address _drawContract) public onlyOwner {
        drawContract = IHierarchicalDrawing(_drawContract);
    }

    // @dev Function to set the pack
    function setPack(uint32 _packID, uint256 _packPrice, uint32[] memory _poolsID, uint32[] memory _amounts) external onlyOwner {
        packsInfo[_packID].basePrice = _packPrice;
        packsInfo[_packID].poolsID = _poolsID;
        packsInfo[_packID].amounts = _amounts;
    }

    /// @dev Modifier that checks if the chain with the given sourceChainSelector is allowlisted and if the sender is allowlisted.
    /// @param _sourceChainSelector The selector of the destination chain.
    /// @param _sender The address of the sender.
    modifier onlyAllowlisted(uint64 _sourceChainSelector, address _sender) {
        if (!allowlistedSourceChains[_sourceChainSelector])
            revert SourceChainNotAllowlisted(_sourceChainSelector);
        if (!allowlistedSenders[_sender]) revert SenderNotAllowlisted(_sender);
        _;
    }

    /// @dev Updates the allowlist status of a source chain for transactions.
    function allowlistSourceChain(
        uint64 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = allowed;
    }

    /// @dev Updates the allowlist status of a sender for transactions.
    function allowlistSender(address _sender, bool allowed) external onlyOwner {
        allowlistedSenders[_sender] = allowed;
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
        ERC20 paymentToken = ERC20(_token);
        ERC20 baseToken = ERC20(basePaymentToken);

        uint256 convertedPrice = uint256(priceConvertor(aggregators[basePaymentToken], aggregators[_token], 18));
        uint256 totalPayment = packsInfo[_packID].basePrice*convertedPrice / 10**(baseToken.decimals() + 18 - paymentToken.decimals());

        return (totalPayment);
    }

    function getPackConvertedNativePrice(uint32 _packID) public view returns(uint256) {
        ERC20 baseToken = ERC20(basePaymentToken);
        uint256 convertedPrice = uint256(priceConvertor(aggregators[basePaymentToken], nativeTokenAggregator, 18));
        uint256 totalPayment = packsInfo[_packID].basePrice*convertedPrice / 10**baseToken.decimals();

        return (totalPayment);
    }

    /// handle a received CCIP message
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override 
    onlyAllowlisted(
        message.sourceChainSelector, 
        abi.decode(message.sender, (address))
    ) {
        bytes4 functionSelector;
        bytes memory data = message.data;
        bytes memory dataSlice = new bytes(data.length - 4);
            // Copy data from index 4 onwards into dataSlice
            for (uint256 i = 4; i < data.length; i++) {
                dataSlice[i - 4] = data[i];
            }        

        assembly {
            functionSelector := mload(add(data, 32))
        }

        // Check the function signature and call the corresponding internal function
        if (functionSelector == bytes4(keccak256("setPurchasedInfo(address,uint32,uint32)"))) {
            // Decode the parameters
            (address purchaser, uint32 packID, uint32 packAmounts) = abi.decode(dataSlice, (address, uint32, uint32));
            
            // Call the internal function with the decoded parameters
            setPurchasedInfo(purchaser, packID, packAmounts);
        } else {
            // Handle unknown function selector or revert
            revert("Unknown function selector");
        }

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector // fetch the source chain identifier (aka selector)
        );
    }
    
    function setPurchasedInfo(
        address _purchaser, 
        uint32 _packID,
        uint32 _packAmounts
    ) internal {
        uint32[] memory _pools = packsInfo[_packID].poolsID;
        uint32[] memory _amounts = packsInfo[_packID].amounts;
        uint32[] memory totalAmounts = new uint32[](_amounts.length);

        uint32 curDrawable;
        for(uint256 i; i<_amounts.length; i++) {
            curDrawable = drawContract.getUserDrawable(_purchaser, _pools[i]);
            totalAmounts[i] = curDrawable + _amounts[i]*_packAmounts;
        }
        // Call the setUserDrawable function in the Drawing contract
        drawContract.setUserDrawable(_purchaser, _pools, totalAmounts); 
    }

    // Function to purchase a game pack
    function purchasePack(address _token, uint32 _packID, uint32 _packAmounts) external {
        uint256 basePrice = packsInfo[_packID].basePrice;
        uint256 totalPayment;
        address purchaser = msg.sender;
        ERC20 paymentToken = ERC20(_token);

        require(_packAmounts > 0, "Pack amount must be greater than 0");
        require(aggregators[_token] != address(0), "Token not supported");

        if(_token == basePaymentToken) {
            totalPayment = _packAmounts*basePrice;
        } else {
            uint256 packConvertedPrice = getPackConvertedPrice(_packID, _token);
            totalPayment = _packAmounts*packConvertedPrice;
        }

        // Check if the purchaser has enough allowance and balance
        require(
            paymentToken.allowance(purchaser, address(this)) >= totalPayment,
            "Insufficient allowance"
        );
        require(
            paymentToken.balanceOf(purchaser) >= totalPayment,
            "Insufficient balance"
        );

        // Transfer tokens from buyer to contract
        require(
            paymentToken.transferFrom(purchaser, address(this), totalPayment),
            "Token transfer failed"
        );

        setPurchasedInfo(purchaser, _packID, _packAmounts);
        emit PackPurchased(purchaser, _packAmounts);
    }

    function purchasePackNative(uint32 _packID, uint32 _packAmounts) external payable {
        address purchaser = msg.sender;
        uint256 packConvertedPrice = getPackConvertedNativePrice(_packID);
        uint256 totalPayment = _packAmounts*packConvertedPrice;
        require(_packAmounts > 0, "Pack amount must be greater than 0");

        // Check if the buyer has enough balance
        require(
            msg.value == totalPayment,
            "Incorrect amount"
        );

        require(
            purchaser.balance >= totalPayment,
            "Insufficient amount"
        );

        setPurchasedInfo(purchaser, _packID, _packAmounts);
        emit PackPurchased(purchaser, _packAmounts);
    }

    function getPackInfo(uint32 _packID) external view returns(uint256 Price, uint32[] memory poolsID, uint32[] memory amounts){
        PackInfo memory pack = packsInfo[_packID];
        return(pack.basePrice, pack.poolsID, pack.amounts);
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