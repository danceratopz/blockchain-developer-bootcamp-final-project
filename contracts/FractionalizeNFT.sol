// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC20/ERC20.sol";

contract XyzCoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("Xyz", "XYZ") {
        _mint(msg.sender, initialSupply);
    }
}
