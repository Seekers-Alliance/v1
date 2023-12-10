# Flexible Hierarchical Drawing Pools by Seekers Alliance

## Introduction
This repository contains the smart contracts for the Flexible Hierarchical Drawing Pools by Seekers Alliance. The main contract is deployed on Avalanche Fuji with cross-chain functions enabled by CCIP. The contract allows for the customization of Hierarchical Drawing Pools so that game developers can freely customize pool probabilities at each level according to their game design at launch, updates, and new releases while maintaining constant and fair pull rates.

The following document contains the setup instructions for our smart contracts, which integrate 4 Chainlink products: VRF, CCIP, Price Feed and Automation. Follow the steps below to set up each contract:
## Contracts Structure
![Alt text](./contracts/ContractStruct.png?raw=true "Contract Structure")
### Roles
1. Owner: The owner of the contracts, who can set up configurations, grant and revoke roles.
3. Seller: The seller of the drawing contract, who can call ```setUserDrawable``` to set users drawable amount.
4. Fulfiller: The fulfiller of the drawing contract, who can call ```fulfillRandomWords``` to return random words to the request.
5. Executor: The executor of the drawing contract, who can call ```execRequest``` for drawing.
6. User: Calls ```purchashPack``` or ```purchasePackNative``` from marketplace contracts to buy the game pack, and call ```sendRequest``` from drawing contract to draw the prize.

---

## Setup steps
### Hierarchical Prize Pool Contract
1. setNFTcontract and setVRFGenerator.
2. setTokenPool and setTokenMaxAmount.
3. setUnitPool.
4. setDrawingPool.
6. Grants Seller role to Marketplace Receiver contract.
7. Grants Fulfiller role to VRF Generator contract.
8. Grants Executor role to Automation contract.

### VRF Manager Contract
1. Deploy the contract with Chainlink VRF configurations (VRF Coordinator, Key Hash, Max Gas Limit, Confirmations).
2. Transfer LINK to this contract for the ```fulfilledRandomwords``` fee.
3. topUPSubscription().
4. addConsumer() and setDrawingContract().

### Marketplace CCIP Sender 
1. Deploy the contract with base payment token address, price feed aggregators and CCIP router address.
2. Transfer LINK or Native token to this contract for CCIP fee.
3. Allowlist destination chain.
4. setPackPrice.

### Marketplace CCIP Receiver 
1. Deploy the contract with base payment token address, price feed aggregators and CCIP router address.
2. setDrawingContract.
3. Allowlist Sender.
4. Allowlist source chain.
5. setPack.

### Automation Contract
1. setDrawingContract.
2. Register new Upkeep from Chainlink Automation website.

### ERC-1155 NFT Contract 
1. Grant Minter role to Hierarchical Prize Pool Contract.

---

## Deployed Contracts:
### Avalanche Fuji testnet
Hierarchical drawing contract: `0xFF51679a88e54314B0AA501eB5Ee5A8ca655D14E`  
ERC-1155 NFT contract: `0x6cF5b3eB63415db6d1AA009C1E9e6267c3210185`  
VRF Manager:
`0xc9C9db99fEBC71Ff0995BF08B9daC5d6f2388824`  
Marketplace Receiver: `0xe8dAed8f0c4Beeb5C6838cd3Bcb4a627D445fd14`  
Automation Contract: `0xDa4cCdA307631fBc61532131e449A3f0E235e918`  
USDT test token: `0xae940284e4eB37Fec1F1Bf1D7f297EB1f07f2B26`
### Sepolia testnet:
Marketplace Sender: `0x63612945C4F194c0dcd1337c646AACe5F604f5Ec`  
USDT test token: `0x4E85938b8cba54F4726A649b727c15Cca379b146`
### OP Goerli testnet:
Marketplace Sender: `0x93101595adD893d24aB7159d0894877A901D36d
`  
USDT test token:
`0x4fcDfcc0f6C7322A029Ea421ae594Dd5A6978826`

---

## Resources
1. VRF Request Status URL: https://vrf.chain.link/fuji/853
2. CCIP Explorer for checking status:
- Sepolia: https://ccip.chain.link/address/0x63612945C4F194c0dcd1337c646AACe5F604f5Ec 
- Op goerli: https://ccip.chain.link/address/0x93101595adD893d24aB7159d0894877A901D36de
- Avalanche Fuji (see “Incoming” tab): https://ccip.chain.link/address/0xe8dAed8f0c4Beeb5C6838cd3Bcb4a627D445fd14
3. Automation History: https://automation.chain.link/fuji/25476883182264389823337878357790461058949639267999155035608326058986877878969
4. NFT Collection:  
https://testnets.opensea.io/collection/seekers-alliance-demo