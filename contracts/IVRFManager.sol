// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVRFManager {
    function requestRandomWords(address requester) external returns (uint256 requestId);

    event RequestSent(uint256 requestId, address _requester);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
}
