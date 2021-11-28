//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// @title ERC721 Contract for Testing
// @author Web3Wannabe
// @notice Simple ERC721 to allow testing of FractionalizeNFT.
contract TestNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("WannabeNFT", "WNFT") {}

    /// @notice Mint a new NFT with metadata at the specified tokenURI and transfer it to the recipient.
    /// @param recipient The address to receive the newly minted NFT.
    /// @param tokenURI The uniform resource identifier specifying the location of the NFT's metadata.
    /// @return The ID of the newly minted NFT.
    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
