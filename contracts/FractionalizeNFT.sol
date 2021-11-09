// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC20/ERC20.sol";
import "OpenZeppelin/openzeppelin-contracts@4.3.2/contracts/token/ERC721/ERC721.sol";

import "./ERC20Factory.sol";

// @title
// @author Web3Wannabe
// @notice
// @dev
contract FractionalizeNFT is IERC721Receiver {

    address public owner = msg.sender;

    mapping (uint => FractionalizedNFT) private fracNFTs;
    uint256 public fracNFTCount = 0;

    struct FractionalizedNFT {
	string symbol;
        address token_address;
        ERC721 nft;
	address payable original_owner;
    }

    constructor() {
        owner = msg.sender;
    }

    event Received(address, uint);
    event NftReceived(address);

    // https://blog.soliditylang.org/2020/03/26/fallback-receive-split/
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        revert();
    }

    function fractionalizeNft(ERC721 nft, uint256 tokenId, string memory name, string memory symbol, uint256 supply) public returns (address) {
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        ERC20 newToken = (new ERC20Factory)(name, symbol, supply, msg.sender);
        address token_address = address(newToken);
        fracNFTs[fracNFTCount] = FractionalizedNFT({symbol: symbol, nft: nft, token_address: token_address, original_owner: payable(msg.sender) });
        fracNFTCount += 1;
        return token_address;
    }

    function redeem() public {
        // A holder of the entire corresponding ERC20 supply can send the tokens in order to redeem the NFT.
    }

    function buyOut() public {
        // A buyer can buy the NFT as specified by the reserve price by sending ETH to the contract.

    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        emit NftReceived(msg.sender);
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

}
