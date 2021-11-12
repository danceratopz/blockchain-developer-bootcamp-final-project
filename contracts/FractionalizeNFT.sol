// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ERC20Factory.sol";

// @title
// @author Web3Wannabe
// @notice
// @dev
contract FractionalizeNFT is IERC721Receiver {

    address public owner = msg.sender;

    mapping (uint => FractionalizedNFT) private fracNFTs;
    uint256 public fracNFTCount = 0;

    //    mapping (address => uint256) userFracNFTs;

    struct FractionalizedNFT {
        uint256 nftTokenId;
        ERC20 erc20Token;
        address erc20Address;
        string erc20Symbol;
        ERC721 nft;
	address payable originalOwner;
        uint256 buyoutPrice;
        State state;
    }

    enum State { Fractionalized, Redeemed, BoughtOut }

    constructor() {
        owner = msg.sender;
    }

    event Received(address, uint);
    event NftReceived(address);
    event Fractionalized(address, uint);
    event Redeemed(address, uint);
    event BoughtOut(address, uint);
    event Claimed(address, uint);

    // https://blog.soliditylang.org/2020/03/26/fallback-receive-split/
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        revert();
    }

    function getERC20Address(uint256 fracNFTId) public returns (address) {
        return fracNFTs[fracNFTId].erc20Address;
    }

    function getERC20Symbol(uint256 fracNFTId) public returns (string memory) {
        return fracNFTs[fracNFTId].erc20Symbol;
    }

    function fractionalizeNft(ERC721 nft,
                              uint256 nftTokenId,
                              string memory erc20Name,
                              string memory erc20Symbol,
                              uint256 erc20Supply,
                              uint256 buyoutPrice) public returns (uint256) {
        nft.safeTransferFrom(msg.sender, address(this), nftTokenId);
        ERC20 erc20Token = (new ERC20Factory)(erc20Name, erc20Symbol, erc20Supply, msg.sender);
        address erc20Address = address(erc20Token);
        fracNFTs[fracNFTCount] = FractionalizedNFT({
            nft: nft,
            nftTokenId: nftTokenId,
            erc20Token: erc20Token,
            erc20Address: erc20Address,
            erc20Symbol: erc20Symbol,
            originalOwner: payable(msg.sender),
            buyoutPrice: buyoutPrice,
            state: State.Fractionalized});
        uint256 fracNFTId = fracNFTCount;
        fracNFTCount += 1;
        emit Fractionalized(msg.sender, fracNFTId);
        return fracNFTId;
    }

    function redeem(uint256 fracNFTId) public payable {
        // A holder of the entire ERC20 supply can send the tokens in order to redeem the NFT.
        uint256 redeemerBalance = fracNFTs[fracNFTId].erc20Token.balanceOf(msg.sender);
        uint256 erc20Supply = fracNFTs[fracNFTId].erc20Token.totalSupply();
        // require(redeemerBalance == erc20Supply, "Redeemeer does not hold the entire supply.");
        fracNFTs[fracNFTId].erc20Token.transferFrom(msg.sender, address(this), redeemerBalance);
        fracNFTs[fracNFTId].nft.safeTransferFrom(address(this), msg.sender, fracNFTs[fracNFTId].nftTokenId);
        emit Redeemed(msg.sender, fracNFTId);
    }

    function buyout(uint256 fracNFTId) public payable {
        // A buyer can buy the NFT as specified by the buyout price by sending ETH to the contract.
        require(msg.value >= fracNFTs[fracNFTId].buyoutPrice, "Sender sent less than the buyout price.");
        fracNFTs[fracNFTId].state = State.BoughtOut;
        fracNFTs[fracNFTId].nft.safeTransferFrom(address(this), msg.sender, fracNFTs[fracNFTId].nftTokenId);
        emit BoughtOut(msg.sender, fracNFTId);
    }

    function claim(uint256 fracNFTId) public {
        // A holder of the ERC20 token can claim his ETH following a buyout.
        require(fracNFTs[fracNFTId].state == State.BoughtOut, "Fractionalized NFT has not been bought out.");
        uint256 claimerBalance = fracNFTs[fracNFTId].erc20Token.balanceOf(msg.sender);
        require(claimerBalance > 0, "Claimer does not hold any tokens.");
        fracNFTs[fracNFTId].erc20Token.transferFrom(msg.sender, address(this), claimerBalance);
        uint256 erc20Supply = fracNFTs[fracNFTId].erc20Token.totalSupply();
        uint256 claimAmountWei = fracNFTs[fracNFTId].buyoutPrice*claimerBalance/erc20Supply;
        payable(msg.sender).transfer(claimAmountWei);
        emit Claimed(msg.sender, fracNFTId);
    }

    function onERC721Received(address operator, address from, uint256 nftTokenId, bytes memory data) public returns (bytes4) {
        emit NftReceived(msg.sender);
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

}
