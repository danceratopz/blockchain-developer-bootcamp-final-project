# 2021 Consensys Blockchain Developer Bootcamp Final Project: A PFP NFT Pimp Shop

## Motivation

It seems extremely likely that NFTs (non-fungible tokens) will become ubiquitous in many aspects of our digital (and
physical) world in the mid to long-term future. One of the current hot topics in the NFT space are PFP (profile picture)
NFTs; NFTs with the specific goal of being used as avatars on social media platforms or in online metaverses. Indeed,
Twitter recently announced that they will allow users to link an Ethereum account to their Twitter and provide NFT
profile picture verification ([link](https://t.co/Z8c6tH3BBy)). Currently, many people often periodically modify their
JPG avatars to suit their mood, reflect a current topic in the news or support a movement they sympathise with. Once PFP
NFTs are commonly supported by social media platforms this avatar modification and enhancement could occur on-chain
using simple interactive tools to generate new NFTs.

## An Accessory Store for ERC-721 NFTs

This aim of this project is to provide an interactive platform where users can "personalise" the avatar ERC-721-based
NFTs they hold in their account. This personalisation has two levels:
1. First, the user can mint a new "accessory" NFT on the platform (perhaps also with the ability to customise the colour
   or other attributes of the accessory). Then, once the user owns an accessory, the frontend should provide a way to
   select one of the accessories in the account's inventory and combine it with another NFT that the account has
   ownership of and display this composition as an image in the frontend (an accessory viewer). This allows a fun and
   interactive way for users to view their NFTs. However, the resulting image may only be viewed on the Accessory Store
   platform.
2. Secondly, the user should have the option to mint a new ERC-721 NFT from an (accessory NFT + NFT) composition that
   they created in the accessory viewer. This new NFT can be used outside of this platform, for example, as a PFP NFT on
   supported platforms or metaverses. The NFT generation could require locking up the original NFT in the accessory
   shop's smart contract in order to verify authenticity of the resulting composed NFT.


## User Workflow

The user:
1. Connects their account using their wallet to the Pimp Shop frontend.
2. Can select ERC-721 NFTs in their account and view them.
3. Can view available templates for "accessory NFTs" (and optionally modify properties).
4. Can mint "accessory NFTs".
5. Prerequisite: Accessory NFT has been minted and are therefore available in the user account's inventory. The user
   can create an image that is a composition of an accessory NFT and one of the other NFTs in their ownership. This
   composition is displayed dynamically on the page.
6. Can mint the resulting composition as a new NFT which can be used on other platforms, for example, as a PFP NFT. 
