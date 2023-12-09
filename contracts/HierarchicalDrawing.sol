// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IHierarchicalDrawing.sol";
import "./Sort.sol";

error EmptyIDs();
error LengthNotMatch();
error TokenExisted(uint256);
error TokenNotExist(uint256);
error UnitPoolExisted(uint32);
error UnitPoolNotExist(uint32);
error DrawingPoolExisted(uint32);
error DrwaingPoolNotExist(uint32);
error DrawableNotEnough(address, uint32);
error RequestNotExist(uint256);

// This smart contract focuses on flexibility and long-term viability
// and mitigates the problem of pull rates being dependent on the NFT supply counts.
// We introduces a flexible hierarchical structure built upon the ERC-1155 standard, 
// so that game developers can freely customize pool probabilities according to their game design
// and launch updates and new releases while maintaining fair pull rates. 

contract HierarchicalDrawing is AccessControl, IHierarchicalDrawing {
    using SafeMath for uint32;
    using SafeMath for uint256;
    uint32 constant UINT32_MAX = type(uint32).max;
    uint256 constant UINT256_MAX = type(uint256).max;

    IMyNFT public nftContract;
    IVRFManager public vrfGenerator;

    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant FULFILLER_ROLE = keccak256("FULFILLER_ROLE");
    
    mapping (address => mapping (uint32 => uint32)) public usersDrawable;
    mapping (uint32 => UnitPoolInfo) public unitPoolsInfo;
    mapping (uint32 => DrawingPoolInfo) public drawingPoolsInfo;
    mapping (uint256 => RequestInfo) public requestsInfo;

    uint32 public unitPoolNonce;
    uint32 public drawingPoolNonce;
    uint256 public requestNonce;
    uint32[] public existedUnit;
    uint32[] public existedDrawing;
    uint32[] public maxAmounts;
    uint32[] public remainings;
    uint256[] public ids;
    uint256[] public requestsQueue;

    constructor(address _initialAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
    }

    modifier onlyOwner() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to admin.");
        _;
    }

    modifier onlySeller() {
        require(hasRole(SELLER_ROLE, msg.sender), "Restricted to sellers.");
        _;
    }

    modifier onlyExecutor() {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Restricted to executors.");
        _;
    }

    modifier onlyFulfiller() {
        require(hasRole(FULFILLER_ROLE, msg.sender), "Restricted to fulfillers.");
        _;
    }

    function setNFTcontract(address _nftContract) external onlyOwner {
        nftContract = IMyNFT(_nftContract);
    }

    function setVRFGenerator(address _vrfGenerator) external onlyOwner {
        vrfGenerator = IVRFManager(_vrfGenerator);
        _grantRole(FULFILLER_ROLE, _vrfGenerator);
    }

    function setTokenPool(uint256[] memory _ids) external onlyOwner {
        ids = _ids;

        emit SetTokenPool(_ids);
    }

    function setTokenMaxAmount(uint32[] memory _maxAmounts) external onlyOwner {
        if(ids.length == 0) revert EmptyIDs();
        if(ids.length != _maxAmounts.length) revert LengthNotMatch();
        
        maxAmounts = _maxAmounts;
        remainings = _maxAmounts;

        emit SetTokenMaxAmount(_maxAmounts);
    }

    function setUnitPool(uint32[] memory _probs) external onlyOwner {
        uint32 _unitID = unitPoolNonce;
        UnitPoolInfo storage unit = unitPoolsInfo[_unitID];
        if(_probs.length != ids.length) revert LengthNotMatch();

        unit.tree = buildOcTree(_probs);
        unit.treeHeight = getOctreeHeight(_probs.length);
        unit.probs = _probs;
        unit.enable = true;
        existedUnit.push(_unitID);
        unitPoolNonce ++;

        emit SetUnitPool(_unitID);
    }

    function setDrawingPool(uint32[] memory _unitIDs, uint32[] memory _probs) external onlyOwner{
        uint32 _poolID = drawingPoolNonce;
        DrawingPoolInfo storage pool = drawingPoolsInfo[_poolID];
        if(_unitIDs.length != _probs.length) revert LengthNotMatch();
        
        pool.accumulatedProbs = getAccumulatedArr(_probs);
        pool.enable = true;
        pool.units = _unitIDs;
        pool.probs = _probs;
        existedDrawing.push(_poolID);
        drawingPoolNonce ++;

        emit SetDrawingPool(_poolID);
    }

    function setUserDrawable(address _user, uint32[] memory _poolsID, uint32[] memory _amounts) external onlySeller {
        if(_poolsID.length != _amounts.length) revert LengthNotMatch();
        for(uint256 i;i<_poolsID.length;i++) {
            usersDrawable[_user][_poolsID[i]] = _amounts[i];
        }
    }

    function sendRequest(uint32[] memory _poolsID, uint32[] memory _drawAmounts) public {
        uint32 _poolID;
        address _requester = msg.sender;
        for(uint256 i;i<_poolsID.length;i++) {
            require(_drawAmounts[i] > 0, "Invalid draw amounts");
            _poolID = _poolsID[i];
            uint32 spendableAmount = usersDrawable[_requester][_poolID];
            if(spendableAmount < _drawAmounts[i]) revert DrawableNotEnough(_requester, _poolID);
            usersDrawable[_requester][_poolID] -= _drawAmounts[i];
        }
    
        uint256 _requestId = vrfGenerator.requestRandomWords(_requester);
        RequestInfo storage request = requestsInfo[_requestId];

        request.exists = true;
        request.requestSender = _requester;
        request.poolsID = _poolsID;
        request.amounts = _drawAmounts;
        requestsQueue.push(_requestId);

        emit RequestSent(_requestId, _requester);
    }
    
    function sendRequestBatch(uint32 requestNum, uint32[] memory _poolsID, uint32[] memory _drawAmounts) public {
        for(uint32 i;i<requestNum;i++) {
            sendRequest(_poolsID, _drawAmounts);
        }
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) external onlyFulfiller {
        RequestInfo storage request = requestsInfo[_requestId];
        if(!request.exists) revert RequestNotExist(_requestId);
        request.fulfilled = true;
        request.randomWords = _randomWords;

        emit RequestFulfilled(_requestId, _randomWords);
    }

    function execRequest() public onlyExecutor returns (uint256[] memory){
        if(pendingRequestNum() == 0) revert("No pending request now.");

        uint256 _requestId = requestsQueue[requestNonce];
        RequestInfo storage request = requestsInfo[_requestId];

        require(request.exists && request.fulfilled, "Request was not fulfilled yet.");

        address _receiver = request.requestSender;
        uint32[] memory _poolsID = request.poolsID;
        uint32[] memory _amounts = request.amounts;
        uint256 _randomWord = request.randomWords[0];
        uint256 totalAmount;
        for(uint256 i;i<_amounts.length;i++){
            totalAmount += _amounts[i];
        }

        uint256[] memory _ids = new uint256[](totalAmount);
        uint32 unitID;
        uint32 randomWord32;
        uint32 idx;
        uint256 idIndex;
        uint256 consumedRandomWord = _randomWord;
        for(uint256 i;i<_poolsID.length;i++) {
            for(uint256 j;j<_amounts[i];j++) {
                (consumedRandomWord, randomWord32) = getRandomWord32(consumedRandomWord);
                unitID = drawUnitPoolID(_poolsID[i], randomWord32);
                (consumedRandomWord, randomWord32) = getRandomWord32(consumedRandomWord);
                idIndex = drawTokenIndex(unitID, randomWord32);
                _ids[idx] = ids[idIndex];

                if(consumedRandomWord == 0) {
                    _randomWord = hash(_randomWord);
                    consumedRandomWord = _randomWord;
                }

                if(maxAmounts[idIndex] < UINT32_MAX) {
                    remainings[idIndex] --;
                    if(remainings[idIndex] == 0) {
                        removeTokenProb(idIndex);
                    }
                }
                idx ++;
            }
        }        
        
        if(totalAmount == 1) {
            nftContract.mint(_receiver, _ids[0], 1, "");
        } else {
            uint256[] memory sortedIDs = QuickSort.sort(_ids);
            uint256[] memory mintIDs;
            uint256[] memory mintAmounts;
            (mintIDs, mintAmounts) = count(sortedIDs);
            nftContract.mintBatch(_receiver, mintIDs, mintAmounts, "");
        }

        requestNonce ++;
        request.completed = true;

        emit RequestCompleted(_requestId, _receiver);
        return (_ids);
    }

    function execRequestBatch() external onlyExecutor {
        uint256 pending = pendingRequestNum();
        for(uint256 i; i<pending;i++) {
            execRequest();
        }
    }

    function drawUnitPoolID(uint32 _poolID, uint32 _randomWord) internal view returns(uint32 _unitID) {
        DrawingPoolInfo memory pool = drawingPoolsInfo[_poolID];
        uint32[] memory probs = pool.accumulatedProbs;

        uint256 unitsNum = pool.units.length;
        uint32 _randomNum;

        _randomNum = _randomWord % probs[unitsNum-1];
        for(uint256 j;j<unitsNum;j++) {
            _unitID = pool.units[j];
            if(_randomNum < probs[j]) {
                return _unitID;
            }
        }
    }
    
    function drawTokenIndex(uint32 _unitID, uint32 _randomWord) internal view returns(uint256 index) {
        UnitPoolInfo memory unit = unitPoolsInfo[_unitID];
        PackedArray.PackedArray32 memory tree = unit.tree;
        uint32[] memory probs = unit.probs;
        uint8 height = unit.treeHeight;
        uint32 cur_prob = _randomWord % PackedArray.get(tree,0);
        uint32 node_prob;
        uint256 tree_length = tree.nums;
        uint256 root_node_idx;
        uint256 next_node_idx;
 
        for(uint8 h; h<height; h++) {
            for(uint8 j=1;j<=8;j++) {
                if(h==height-1) {
                    next_node_idx = 8*root_node_idx+j-tree_length;
                    node_prob = probs[next_node_idx];
                    if(cur_prob >= node_prob) {
                        cur_prob -= node_prob;
                    } else {
                        return next_node_idx;
                    }
                } else {
                    next_node_idx = 8*root_node_idx+j;
                    node_prob = PackedArray.get(tree,next_node_idx);
                    if(cur_prob < node_prob) {
                        root_node_idx = next_node_idx;
                        break;
                    } else {
                        cur_prob -= node_prob;
                    }
                }
            }   
        }
    }

    function removeTokenProb(uint256 _index) internal {
        uint32[] memory _existedUnit = existedUnit;

        uint32 _unitID;
        for(uint256 i;i<_existedUnit.length;i++) {
            _unitID = _existedUnit[i];
            UnitPoolInfo memory unit = unitPoolsInfo[_unitID];

            if(unit.probs[_index] != 0) {
                updateTokenProb(_unitID, _index, 0);
                checkUnitStatus(_unitID);
            }
        }
    }

    function closeUnitPool(uint32 _unitID) internal {
        UnitPoolInfo storage unit = unitPoolsInfo[_unitID];

        uint32[] memory _units;
        for(uint256 i;i<existedDrawing.length;i++) {
            DrawingPoolInfo storage pool = drawingPoolsInfo[existedDrawing[i]];
            _units = pool.units;
            for(uint256 j;j<_units.length;j++) {
                if(_units[j] == _unitID) {
                    pool.probs[j] = 0;
                    pool.accumulatedProbs = getAccumulatedArr(pool.probs);
                    break;
                }
            }
        }
        
        pop(existedUnit, _unitID);
        unit.enable = false;
    }

    function updateTokenProb(uint32 _unitID, uint256 _index, uint32 _prob) internal {
        UnitPoolInfo storage unit = unitPoolsInfo[_unitID];
        PackedArray.PackedArray32 memory tree = unit.tree;

        uint8 height = unit.treeHeight;
        uint32 pre_prob = unit.probs[_index];
        uint32 root_prob;
        uint256 root_node = _index + tree.nums;
        for(uint8 i;i<height;i++) {
            root_node = (root_node-1) >> 3;
            root_prob = PackedArray.get(tree, root_node);
            tree = PackedArray.set(tree, root_node, root_prob+_prob-pre_prob);
        }
        unit.probs[_index] = _prob;
        unit.tree = tree;
    }

    function checkUnitStatus(uint32 _unitID) internal {
        UnitPoolInfo memory unit = unitPoolsInfo[_unitID];
        if(PackedArray.get(unit.tree,0) == 0) {
            closeUnitPool(_unitID);
        }
    }

    function getOctreeHeight(uint256 _nums) internal pure returns(uint8 h){
        h = 1;
        while(8**h < _nums) {
            h++;
        }
        return h;
    }

    function buildOcTree(uint32[] memory _probs) internal pure returns (PackedArray.PackedArray32 memory) {
        // if(_probs.length != ids.length) revert LengthNotMatch();
        uint32 rootValue;
        uint32 treeHeight = getOctreeHeight(_probs.length);
        uint256 rootIndex;
        uint256 rowElements;
        uint256 shift_index;
        uint256 cur_index;
        uint256 nums = _probs.length;
        uint256 treeElements = (8**treeHeight-1)/7;
        uint32[] memory ocTree = new uint32[](treeElements);

        for(uint32 h; h<treeHeight; h++) {
            rowElements = 8**(treeHeight-h);
            shift_index = (rowElements-1)/7;
            for(uint256 i;i<rowElements;i++) {
                cur_index = i+shift_index;
                if(h!=0) {
                    rootValue += ocTree[cur_index];
                } else {
                    if(i == nums) break;
                    rootValue += _probs[i];
                }

                if(cur_index%8 == 0 || i == (nums-1)) {
                    rootIndex = (cur_index-1) >> 3;
                    ocTree[rootIndex] = rootValue;
                    rootValue = 0;
                }   
            }
        }

        PackedArray.PackedArray32 memory pooledResult = PackedArray.pack(ocTree);

        return pooledResult;
    }

    function getTokenPoolInfo() external view returns(uint256[] memory) {
        return (ids);
    }

    function getTokenMaxAmounts() external view returns(uint32[] memory) {
        return (maxAmounts);
    }

    function getTokenRemainings() external view returns(uint32[] memory) {
        return (remainings);
    }

    function getTokenInfo(uint256 _id) external view returns(bool, uint256, uint32, uint32) {
        for(uint256 i;i<ids.length;i++) {
            if(ids[i] == _id) {
                return(true, i, maxAmounts[i], remainings[i]);
            }
        }
        return (false, 0,0,0);
    }

    function getExistedUnitPool() external view returns(uint32[] memory unitPools) {
        return existedUnit;
    }
    
    function getExistedDrawingPool() external view returns(uint32[] memory drawingPools) {
        return existedDrawing;
    }
    
    function getTokenSupply(uint256 _id) external view returns(uint256) {
        return nftContract.totalSupply(_id);
    }

    function getUnitPoolInfo(uint32 _unitID) external view returns(uint32[] memory, PackedArray.PackedArray32 memory) {
        UnitPoolInfo memory unit = unitPoolsInfo[_unitID];
        return (unit.probs, unit.tree);
    }

    function getPoolInfo(uint32 _poolID) external view returns(uint32[] memory, uint32[] memory, uint32[] memory) {
        DrawingPoolInfo memory pool = drawingPoolsInfo[_poolID];
        return (pool.units, pool.probs, pool.accumulatedProbs);
    }

    function pendingRequestNum() public view returns(uint256) {
        return (requestsQueue.length - requestNonce);
    }

    function getUserDrawable(address _user, uint32 _poolID) external view returns(uint32) {
        return usersDrawable[_user][_poolID];
    }

    function getReuqestQueue() external view returns(uint256[] memory) {
        return requestsQueue;
    }

    function getLastRequestId() external view returns(uint256) {
        return requestsQueue[requestNonce];
    }

    function getRequestInfo(uint256 _requestId) external view returns(RequestInfo memory) {
        return requestsInfo[_requestId];
    }

    function getAccumulatedArr(uint32[] memory _arr) internal pure returns(uint32[] memory result) {
        uint32 _totalProb;
        result = new uint32[](_arr.length);
        for(uint256 i;i<_arr.length;i++) {
            _totalProb += _arr[i];
            result[i] = _totalProb;
        }
        return result;
    }

    function getRandomWord32(uint256 _randomWord) internal pure returns(uint256, uint32){
        uint32 randomWord32 = uint32(_randomWord);
        _randomWord >>= 32;
        return (_randomWord, randomWord32);
    }

    function hash(uint256 _randomWord) internal pure returns(uint256) {
        return uint256(keccak256(abi.encodePacked(_randomWord)));
    }

    function count(uint256[] memory _sortedArr) internal pure returns(uint256[] memory, uint256[] memory) {
        if(_sortedArr.length == 0) {
            return(_sortedArr, _sortedArr);
        }
        
        uint256 uniqueIdNum = 1;
        for(uint256 i = 1; i < _sortedArr.length; i++) {
            if(_sortedArr[i] != _sortedArr[i-1]) {
                uniqueIdNum ++;
            }
        }

        uint256[] memory mintIDs = new uint256[](uniqueIdNum);
        uint256[] memory mintAmounts = new uint256[](uniqueIdNum);
        uint256 curID = _sortedArr[0];
        uint256 curIndex;
        mintIDs[curIndex] = curID;

        for(uint256 i; i < _sortedArr.length; i++) {
            if(_sortedArr[i] != curID) {
                curID = _sortedArr[i];
                curIndex ++;
                mintIDs[curIndex] = curID;
            }
            mintAmounts[curIndex] ++;
        }
        return (mintIDs, mintAmounts);
    }

    function pop(uint32[] storage _arr, uint32 _id) internal {
        uint256 nums = _arr.length;
        for(uint256 i; i<nums;i++) {
            if (_arr[i] == _id) {
                _arr[i] = _arr[nums-1];
                _arr.pop();
                break;
            }
        }
    }
}