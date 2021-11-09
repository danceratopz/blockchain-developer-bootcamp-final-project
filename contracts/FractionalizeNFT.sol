// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC20/ERC20.sol";
import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC721/ERC721.sol";

import "./ERC20Factory.sol";

// @title
// @author Web3Wannabe
// @notice
// @dev
contract FractionalizeNFT is IERC721Receiver {

    address public owner = msg.sender;

    struct Item {
	string symbol;
        address token_address;
        ERC721 nft;
	address payable original_owner;
    }

    Item fractionalized_nft;

    constructor() {
        owner = msg.sender;
    }

    event Received(address, uint);

    // https://blog.soliditylang.org/2020/03/26/fallback-receive-split/
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
    fallback() external payable {
        revert();
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function createERC20(uint256 _initialAmount, string memory _name, string memory _symbol) public returns (address) {
        ERC20 newToken = (new ERC20Factory)(_name, _symbol, _initialAmount, msg.sender);
        return address(newToken);
    }

    function fractionalizeNft(ERC721 nft, uint256 tokenId, uint256 supply, string memory name, string memory symbol) public returns (address) {
        //nft.approve(address(this), tokenId);
        //nft.safeTransferFrom(msg.sender, address(this), tokenId);
        address token_address = createERC20(supply, name, symbol);
        fractionalized_nft = Item({symbol: symbol, nft: nft, token_address: token_address, original_owner: payable(msg.sender) });
        return token_address;
    }

}
