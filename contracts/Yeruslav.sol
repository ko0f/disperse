// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Yeruslav is ERC20 {
    constructor() ERC20("Yeruslav", "YER") {
    }

    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }
}
