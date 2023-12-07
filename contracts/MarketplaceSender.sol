// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IHierarchicalDrawing.sol";

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
    address public paymentToken;

    // Mapping to keep track of allowlisted destination chains.
    mapping(uint64 => bool) public allowlistedDestinationChains;
    // Mapping to keep track of price feed aggregator of the token.
    mapping(uint32 => uint256) public packsPrice;

    constructor(
        address _paymentToken,
        address router,
        address link
    ) {
        i_router = router;
        i_link = link;
        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);
        paymentToken = _paymentToken;
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
    
    // Function to set the pack price (only owner)
    function setPackPrice(uint32 _packID, uint256 _packPrice) external onlyOwner {
        packsPrice[_packID] = _packPrice;
    }
    
    // ### CHAINLINK PRODUCT: CCIP ###  
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
        uint32 _packID, 
        uint32 _packAmounts,
        PayFeesIn payFeesIn
    ) external {
        uint256 totalPayment;
        address buyer = msg.sender;
        ERC20 token = ERC20(paymentToken);

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
    function withdrawNative() external onlyOwner{
        payable(owner()).transfer(address(this).balance);
    }
}
