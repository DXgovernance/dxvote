// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.6;

library Arrays {
  
  function average(uint256 a, uint256 b) internal pure returns (uint256) {
    // (a + b) / 2 can overflow, so we distribute
    return (a / 2) + (b / 2) + ((a % 2 + b % 2) / 2);
  }

  function findUpperBound(uint256[] storage _array, uint256 _element) internal view returns (uint256) {
    uint256 low = 0;
    uint256 high = _array.length;

    while (low < high) {
      uint256 mid = average(low, high);

      if (_array[mid] > _element) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    // At this point at `low` is the exclusive upper bound. We will return the inclusive upper bound.

    if (low > 0 && _array[low - 1] == _element) {
      return low - 1;
    } else {
      return low;
    }
  }
}
