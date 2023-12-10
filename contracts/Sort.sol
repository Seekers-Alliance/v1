// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library QuickSort {
    function sort(uint256[] memory arr) internal pure returns (uint256[] memory) {
        if (arr.length <= 1) {
            return arr;
        }
        
        quickSort(arr, int(0), int(arr.length - 1));
        return arr;
    }
    
    function quickSort(uint256[] memory arr, int left, int right) internal pure {
        if (left < right) {
            int pivotIndex = partition(arr, left, right);
            if (pivotIndex > left) {
                quickSort(arr, left, pivotIndex - 1);
            }
            quickSort(arr, pivotIndex + 1, right);
        }
    }
    
    function partition(uint256[] memory arr, int left, int right) internal pure returns (int) {
        uint256 pivot = arr[uint256(right)];
        int i = left - 1;
        
        for (int j = left; j < right; j++) {
            if (arr[uint256(j)] <= pivot) {
                i++;
                (arr[uint256(i)], arr[uint256(j)]) = (arr[uint256(j)], arr[uint256(i)]);
            }
        }
        
        (arr[uint256(i + 1)], arr[uint256(right)]) = (arr[uint256(right)], arr[uint256(i + 1)]);
        return i + 1;
    }
}
