// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC20/ERC20.sol";

contract ERC20Factory is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address tokenReceiver) ERC20(name, symbol) {
        _mint(tokenReceiver, initialSupply);
    }
}
