// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 Factory
/// @author Web3Wannabe
/// @notice A helper that creates a new ERC20 tkoen with the specified parameters and sends the total supply to the specified address.
contract ERC20Factory is ERC20 {

    /// @notice Create a new ERC20 contract and transfer the total supply to the specified tokenReceiver.
    /// @param name The name of the newly created ERC20 token.
    /// @param symbol The symbol of the newly created ERC20 token.
    /// @param initialSupply The initial supply of the newly created ERC20 token.
    /// @param tokenReceiver The address to transfer the total suply of the token to.
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address tokenReceiver
    ) ERC20(name, symbol) {
        _mint(tokenReceiver, initialSupply);
    }
}
