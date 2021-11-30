# Design Pattern Decisions

This project made use of the following patterns.

## Inheritance

The `FractionalizeNFT` contract inherits from OpenZeppelin's `IERC721Receiver` to enable use of `safeTransfer()` (from OpenZeppelin's `ERC721` implementation) to transfer ERC721 assets to the `FractionalizeNFT` contract. `TestNFT` inherits from OpenZeppelin's `ERC721URIStorage` to ensure that it uses a well-tested implementation of the ERC721 standard and from OpenZeppelin's `Ownable` contracts (see Ownable Pattern, below).

## Inter-Contract Execution

The `FractionalizeNFT` contract calls external fuctions from OpenZeppelin contracts, in particular, it creates new ERC20 tokens (upon NFT fractionalization) using the constructor from OpenZeppelin's ERC20 implementation.

## Ownable Pattern

The `TestNFT` contract inherits from OpenZeppelin's `Ownable` contract to ensure that its `mintNFT()` method may only be called by the deployer.
