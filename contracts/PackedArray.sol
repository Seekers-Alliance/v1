// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library PackedArray {

    struct PackedArray32 {
        uint256 nums;
        uint256[] result;
    }

    function pack(uint32[] memory _arr) public pure returns(PackedArray32 memory) {
        PackedArray32 memory packedArray;
        packedArray.nums = uint32(_arr.length);

        uint256 rows = _arr.length/8;
        if(_arr.length % 8 != 0) {
            rows ++;
        }
        
        packedArray.result = new uint256[](rows);
        for(uint256 i;i<_arr.length;i++) {
            packedArray = set(packedArray, i, _arr[i]);
        }

        return packedArray;
    }

    function set(PackedArray32 memory p, uint256 index, uint32 data) public pure returns(PackedArray32 memory){
        uint256 row = index / 8;
        uint256 i = index % 8;
        uint256 mask = ~(uint256(type(uint32).max) << 32 * (7 - i));
        p.result[row] &= mask;
        p.result[row] |= (uint256(data) << 32 * (7 - i));

        return p;
    }

    function get(PackedArray32 memory p, uint256 index) public pure returns(uint32) {
        require(index < p.nums, "Index out of range.");
        uint256 row = index / 8;
        uint256 i = index % 8;
        return uint32(p.result[row] >> (7-i)*32);
    }
}