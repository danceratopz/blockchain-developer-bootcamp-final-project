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
        uint256 tokenId;
        address tokenAddress;
        string tokenSymbol;
        ERC721 nft;
	address payable originalOwner;
        uint256 buyoutPrice;
    }

    // TODO: Introduce state.
    // enum State {  }

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

    function getERC20Address(uint256 id) public returns (address) {
        return fracNFTs[id].tokenAddress;
    }

    function getERC20Symbol(uint256 id) public returns (string memory) {
        return fracNFTs[id].tokenSymbol;
    }

    function fractionalizeNft(ERC721 nft,
                              uint256 tokenId,
                              string memory name,
                              string memory symbol,
                              uint256 supply,
                              uint256 buyoutPrice) public returns (uint256) {
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        ERC20 newToken = (new ERC20Factory)(name, symbol, supply, msg.sender);
        address tokenAddress = address(newToken);
        fracNFTs[fracNFTCount] = FractionalizedNFT({symbol: symbol,
                    nft: nft,
                    tokenId: tokenId,
                    tokenAddress: tokenAddress,
                    tokenSymbol: symbol,
                    originalOwner: payable(msg.sender),
                    buyoutPrice: buyoutPrice});
        // TODO: Add fracNFTs[id].state
        uint256 fracNFTId = fracNFTCount;
        fracNFTCount += 1;
        return fracNFTId;
    }

    function redeem() public {
        // A holder of the entire corresponding ERC20 supply can send the tokens in order to redeem the NFT.
    }

    function buyout(uint256 id) public payable {
        // A buyer can buy the NFT as specified by the buyout price by sending ETH to the contract.
        require(msg.value >= fracNFTs[id].buyoutPrice, "Sender sent less than the buyout price.");
        // TODO: Update fracNFTs[id].state
        fracNFTs[id].nft.safeTransferFrom(address(this), msg.sender, fracNFTs[id].tokenId);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        emit NftReceived(msg.sender);
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

}
