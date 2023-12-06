// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMyNFT {
    function mint(address _account, uint256 _id, uint256 _amount, bytes memory data) external;
    function mintBatch(address _account,uint256[] memory _ids,uint256[] memory _amounts,bytes memory data) external;
    function totalSupply(uint256 id) external view returns(uint256);
    function totalSupply() external view returns(uint256);
}