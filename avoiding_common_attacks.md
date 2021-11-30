# Avoiding Common Attacks

This project conciously avoids the following common attack vectors and issues:

## [SWC-107](https://swcregistry.io/docs/SWC-107) Reentrancy

The contract always reads and write to persistent state following external calls. In particular, state is always updated before performing ether, ERC20 or ERC721 transfers to avoid reentrancy attacks.

## [SWC-113](https://swcregistry.io/docs/SWC-113) DoS with Failed Call

Only one call is ever made in a single transaction and users must `claim()` their ether upon a `buyout()` of a fractionalized NFT; the funds are not pushed (avoids DoS with Unexpected revert).

## [SWC-103](https://swcregistry.io/docs/SWC-103) Floating Pragma

No floating pragmas are set; the solc version is fixed. This ensures that the byteocde does not vary between builds in different environments that may use different solc versions. 
