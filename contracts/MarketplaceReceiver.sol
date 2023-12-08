// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IHierarchicalDrawing.sol";

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
    mapping (uint32 => PackInfo) packsInfo;

    address public basePaymentToken;
    IHierarchicalDrawing public drawContract;
    
    constructor(
        address _ccipRouter,
        address _basePaymentToken
    ) CCIPReceiver(_ccipRouter){
        basePaymentToken = _basePaymentToken;
    }

    function setDrawContract(address _drawContract) public onlyOwner {
        drawContract = IHierarchicalDrawing(_drawContract);
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

    modifier onlyThisContract() {
        if (msg.sender != address(this)) revert CallerNotAllowed(msg.sender);
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

    // Function to set the pack (only owner)
    function setPack(uint32 _packID, uint256 _packPrice, uint32[] memory _poolsID, uint32[] memory _amounts) external onlyOwner {
        packsInfo[_packID].basePrice = _packPrice;
        packsInfo[_packID].poolsID = _poolsID;
        packsInfo[_packID].amounts = _amounts;
    }

    // ### CHAINLINK PRODUCT: CCIP ###  
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
        // (bool success, ) = address(this).call(message.data);
        // require(success);

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
    function purchasePack(uint32 _packID, uint32 _packAmounts) external {
        uint256 basePrice = packsInfo[_packID].basePrice;
        uint256 totalPayment;
        address purchaser = msg.sender;
        ERC20 paymentToken = ERC20(basePaymentToken);

        totalPayment = _packAmounts*basePrice;

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