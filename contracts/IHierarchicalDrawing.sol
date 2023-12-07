// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./PackedArray.sol";
import "./IMyNFT.sol";
import "./IVRFManager.sol";

interface IHierarchicalDrawing {
    struct UnitPoolInfo {
        bool enable;
        uint8 treeHeight;
        uint32[] probs;
        PackedArray.PackedArray32 tree;
    }

    struct DrawingPoolInfo {
        bool enable;
        uint32[] units;
        uint32[] probs;
        uint32[] accumulatedProbs;
    }

    struct RequestInfo {
        bool exists;
        bool fulfilled;
        bool completed;
        address requestSender;
        uint32[] poolsID;
        uint32[] amounts;
        uint256[] randomWords;
    }

    function execRequest() external returns (uint256[] memory);
    function execRequestBatch() external;
    function getUserDrawable(address _user, uint32 _poolID) external view returns(uint32);
    function setUserDrawable(address _user, uint32[] memory _poolsID, uint32[] memory _amounts) external;
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) external;

    event SetUnitPool(uint32 unitPoolID);
    event SetDrawingPool(uint32 drawingPoolID);
    event RequestSent(uint256 requestId, address _requester);
    event RequestFulfilled(uint256 indexed requestId, uint256[] randomWords);
    event RequestCompleted(uint256 indexed requestId, address indexed requester);
}