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

    mapping (uint => FractionalizedNFT) public fracNFTs;
    uint256 public fracNFTCount = 0;

    struct FractionalizedNFT {
        uint256 fracNFTId;
        uint256 nftTokenId;
        address erc721Address;
        address erc20Address;
        string erc20Symbol;
        string erc20Name;
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
    event Fractionalized(address, uint, string, address);
    event Redeemed(address, uint);
    event BoughtOut(address, uint);
    event Claimed(address, uint);

    /// @notice List of all property ids.
    /// @dev Used as a helper when iterating available properties in frontend client.
    uint[] public idList;

    /// @notice idList length.
    /// @dev Used as a helper when iterating available properties in frontend client.
    uint public idListLength;

    // https://blog.soliditylang.org/2020/03/26/fallback-receive-split/
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        revert();
    }

    function getERC20Address(uint256 fracNFTId) public view returns (address) {
        return fracNFTs[fracNFTId].erc20Address;
    }

    function getERC20Symbol(uint256 fracNFTId) public view returns (string memory) {
        return fracNFTs[fracNFTId].erc20Symbol;
    }

    function getState(uint256 fracNFTId) public view returns (State) {
        return fracNFTs[fracNFTId].state;
    }

    function fractionalizeNft(address nftContractAddress,
                              uint256 nftTokenId,
                              string memory erc20Name,
                              string memory erc20Symbol,
                              uint256 erc20Supply,
                              uint256 buyoutPrice) public returns (uint256) {
        ERC721 nft = ERC721(nftContractAddress);
        nft.safeTransferFrom(msg.sender, address(this), nftTokenId);
        ERC20 erc20 = (new ERC20Factory)(erc20Name, erc20Symbol, erc20Supply, msg.sender);
        uint256 fracNFTId = fracNFTCount;
        fracNFTs[fracNFTCount] = FractionalizedNFT({
            fracNFTId: fracNFTId,
            nftTokenId: nftTokenId,
            erc721Address: nftContractAddress,
            erc20Address: address(erc20),
            erc20Symbol: erc20Symbol,
            erc20Name: erc20Name,
            originalOwner: payable(msg.sender),
            buyoutPrice: buyoutPrice,
            state: State.Fractionalized});
        idList.push(fracNFTCount);
        idListLength = idList.length;
        fracNFTCount += 1;
        emit Fractionalized(msg.sender, fracNFTId, erc20Symbol, address(erc20));
        return fracNFTId;
    }

    function redeem(uint256 fracNFTId) public payable {
        // A holder of the entire ERC20 supply can send the tokens in order to redeem the NFT.
        ERC20 erc20 = ERC20(fracNFTs[fracNFTId].erc20Address);
        uint256 redeemerBalance = erc20.balanceOf(msg.sender);
        uint256 erc20Supply = erc20.totalSupply();
        require(redeemerBalance == erc20Supply, "Redeemeer does not hold the entire supply.");
        erc20.transferFrom(msg.sender, address(this), redeemerBalance);
        ERC721 erc721 = ERC721(fracNFTs[fracNFTId].erc721Address);
        erc721.safeTransferFrom(address(this), msg.sender, fracNFTs[fracNFTId].nftTokenId);
        emit Redeemed(msg.sender, fracNFTId);
    }

    function buyout(uint256 fracNFTId) public payable {
        // A buyer can buy the NFT as specified by the buyout price by sending ETH to the contract.
        require(msg.value >= fracNFTs[fracNFTId].buyoutPrice, "Sender sent less than the buyout price.");
        fracNFTs[fracNFTId].state = State.BoughtOut;
        ERC721 erc721 = ERC721(fracNFTs[fracNFTId].erc721Address);
        erc721.safeTransferFrom(address(this), msg.sender, fracNFTs[fracNFTId].nftTokenId);
        emit BoughtOut(msg.sender, fracNFTId);
    }

    function claim(uint256 fracNFTId) public {
        // A holder of the ERC20 token can claim his ETH following a buyout.
        require(fracNFTs[fracNFTId].state == State.BoughtOut, "Fractionalized NFT has not been bought out.");
        ERC20 erc20 = ERC20(fracNFTs[fracNFTId].erc20Address);
        uint256 claimerBalance = erc20.balanceOf(msg.sender);
        require(claimerBalance > 0, "Claimer does not hold any tokens.");
        erc20.transferFrom(msg.sender, address(this), claimerBalance);
        uint256 erc20Supply = erc20.totalSupply();
        uint256 claimAmountWei = fracNFTs[fracNFTId].buyoutPrice*claimerBalance/erc20Supply;
        payable(msg.sender).transfer(claimAmountWei);
        emit Claimed(msg.sender, fracNFTId);
    }

    function onERC721Received(address operator, address from, uint256 nftTokenId, bytes memory data) public returns (bytes4) {
        emit NftReceived(msg.sender);
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

}
