# 2021 ConsenSys Blockchain Developer Bootcamp Final Project: An NFT Fractionalizer

[![Build](https://github.com/web3wannabe/blockchain-developer-bootcamp-final-project/actions/workflows/main.yaml/badge.svg)](https://github.com/web3wannabe/blockchain-developer-bootcamp-final-project/actions/workflows/main.yaml)

## Motivation and Aim

It seems extremely likely that NFTs (non-fungible tokens) will become ubiquitous in many aspects of our digital (and
physical) world in the mid to long-term future. As NFTs become more widely adopted, multiple parties may wish to share
ownership of a single NFT. Dividing the ownership of NFTs is possible on smart programming platforms by locking the NFT
in a contract in return for a specified quantity of tokens that each represent partial ownership of the locked
NFT. These tokens may then be distributed to multiple accounts. This process is known as "fractionalization" of an
NFT. The aim of this project is to implement a simple EVM-based dapp (decentralized application) that allows a user to
fractionalize their [ERC721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) NFTs into
[ERC20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) tokens. The most popular example of a dapp
that implements this functionality is [fractional.art](https://fractional.art/).

## Workflow: Contract Actions and Participants

Actions:
1. __Fractionalize__: An **NFT owner** can __fractionalize__ their NFT by transferring the NFT to the contract. In
  return the NFT owner receives the entire supply of a newly created ERC20 token that they specified at
  fractionalization. The **NFT Owner** also sets an initial buyout price for the NFT at fractionalization.
2. __Buyout__: A **buyer** can __buyout__ (__purchase__) the locked NFT by transferring (at least) the specified amount
   of ETH to the contract. The NFT gets transferred to the **buyer's** account.
3. __Claim__: Following a buyout, an **ERC20 token holder** can __claim__ their share of the **buyout** price received
   from the **buyer** as determined by the proportion of the ERC20 token supply that they hold.
4. __Redeem__ The **holder of all ERC20 tokens** can __redeem__ the NFT by sending all of the the ERC20 tokens to the
  contract; the NFT is transferred to the redeeming account. Redemption allows the holder of all the tokens to
  "unfractionalize" the NFT. The most practical use case is that the original owner decided they no longer wanted to
  fractionalize the NFT.

Possible improvements:
1. __Update buyout price__: An **ERC20 token holder** can __update the buyout price__ weighted by the proportion of the
ERC20 token supply that they hold.
