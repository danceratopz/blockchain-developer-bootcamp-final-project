// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ERC20Factory.sol";

// @title NFT Fractionalizer with Buyout Functionality
// @author Web3Wannabe
// @notice NFTs can be sent to the contract with a specified buyout price. The sender receives the total supply of a newly created ERC20 token.
contract FractionalizeNFT is IERC721Receiver {
    address public owner = msg.sender;

    mapping(uint256 => FractionalizedNFT) public fracNFTs; // A mapping of all fractionalized NFTs.
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

    enum State {
        Fractionalized,
        Redeemed,
        BoughtOut
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Emitted when ether is sent to the contract.
    /// @param sender The sender of the transaction/ether.
    /// @param value The amount of ether sent.
    event Received(address indexed sender, uint256 indexed value);

    /// @notice Emitted when an NFT is transferred to the FractionalizeNFT contract.
    /// @param sender The address that sent the NFT.
    event NftReceived(address indexed sender);

    /// @notice Emitted when a user successfully fractionalizes an NFT and receives the total supply of the newly created ERC20 token.
    /// @param sender The address that sent/fractionalized the NFT (i.e., the address that called fractionalize()).
    /// @param fracNFTId The ID of the newly fractionalized NFT.
    /// @param erc20Name The name of the newly created ERC20 token.
    /// @param erc20Address The contract address of the newly created ERC20 token.
    event Fractionalized(
        address indexed sender,
        uint256 indexed fracNFTId,
        string indexed erc20Name,
        address erc20Address
    );

    /// @notice Emitted when a user successfully redeems an NFT in exchange for the total ERC20 supply.
    /// @param sender The address that redeemed the NFT (i.e., the address that called redeem()).
    /// @param fracNFTId The index of the fractionalized NFT that was redeemed.
    event Redeemed(address indexed sender, uint256 indexed fracNFTId);

    /// @notice Emitted when a user successfully claims a payout following the buyout of an NFT from the FractionalizeNFT contract.
    /// @param sender The address that the user held ERC20 tokens for (i.e., the address that called claim()).
    /// @param fracNFTId The index of the fractionalized NFT that was bought.
    event Claimed(address indexed sender, uint256 indexed fracNFTId);

    /// @notice Emitted when a user successfully buys an NFT from the FractionalizeNFT contract.
    /// @param sender The address that bought the NFT (i.e., the address that called buyout()).
    /// @param fracNFTId The index of the fractionalized NFT that was bought.
    event BoughtOut(address indexed sender, uint256 indexed fracNFTId);

    /// @notice List of all fractionalized NFT ids.
    /// @dev Used as a helper when iterating over fractionalized NFTs in frontend clients.
    uint256[] public idList;

    /// @notice idList length.
    /// @dev Used as a helper when iterating over fractionalized NFTs in frontend clients.
    uint256 public idListLength;

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        revert();
    }

    /// @notice A getter function for the contract address of a fractionalized NFT's ERC20 token.
    /// @param fracNFTId The ID of the fractionalized NFT.
    /// @return The ERC20 contract address.
    function getERC20Address(uint256 fracNFTId) public view returns (address) {
        return fracNFTs[fracNFTId].erc20Address;
    }

    /// @notice A getter function for the symbol of a fractionalized NFT's ERC20 token.
    /// @param fracNFTId The ID of the fractionalized NFT.
    /// @return The ERC20's symobl.
    function getERC20Symbol(uint256 fracNFTId)
        public
        view
        returns (string memory)
    {
        return fracNFTs[fracNFTId].erc20Symbol;
    }

    /// @notice A getter function for the state of a fractionalized NFT.
    /// @param fracNFTId The ID of the fractionalized NFT.
    /// @return The fractionalized NFT's state (Fractionalized, Redeemed or BoughtOut).
    function getState(uint256 fracNFTId) public view returns (State) {
        return fracNFTs[fracNFTId].state;
    }

    /// @notice Create a fractionalized NFT: Lock the NFT in the contract; create a new ERC20 token, as specified; and transfer the total supply of the token to the sender.
    /// @param nftContractAddress The address of the NFT that is to be fractionalized.
    /// @param nftTokenId The token ID of the NFT that is to be fractionalized.
    /// @param erc20Name The name of the newly created ERC20 token.
    /// @param erc20Symbol The symbol of the newly created ERC20 token.
    /// @param erc20Supply The total supply of the newly created ERC20 token.
    /// @param buyoutPrice The price (in Wei) for which the fractionalized NFT can be be bought for from the contract.
    /// @dev Note, the NFT must be approved for transfer by the FractionalizeNFT contract.
    /// @return The ID of the newly created fractionalized NFT.
    function fractionalizeNft(
        address nftContractAddress,
        uint256 nftTokenId,
        string memory erc20Name,
        string memory erc20Symbol,
        uint256 erc20Supply,
        uint256 buyoutPrice
    ) public returns (uint256) {
        ERC721 nft = ERC721(nftContractAddress);
        nft.safeTransferFrom(msg.sender, address(this), nftTokenId);
        ERC20 erc20 = (new ERC20Factory)(
            erc20Name,
            erc20Symbol,
            erc20Supply,
            msg.sender
        );
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
            state: State.Fractionalized
        });
        idList.push(fracNFTCount);
        idListLength = idList.length;
        fracNFTCount += 1;
        emit Fractionalized(msg.sender, fracNFTId, erc20Symbol, address(erc20));
        return fracNFTId;
    }

    /// @notice A holder of the entire ERC20 supply can call redeem in order to receive the underlying NFT from the contract. The ERC20 tokens get transferred to the contract address.
    /// @param fracNFTId The ID of the fractionalized NFT to redem.
    /// @dev Note, the ERC20 must be approved for transfer by the FractionalizeNFT contract before calling redeem().
    function redeem(uint256 fracNFTId) public {
        ERC20 erc20 = ERC20(fracNFTs[fracNFTId].erc20Address);
        uint256 redeemerBalance = erc20.balanceOf(msg.sender);
        uint256 erc20Supply = erc20.totalSupply();
        require(
            redeemerBalance == erc20Supply,
            "Redeemeer does not hold the entire supply."
        );
        erc20.transferFrom(msg.sender, address(this), redeemerBalance);
        ERC721 erc721 = ERC721(fracNFTs[fracNFTId].erc721Address);
        erc721.safeTransferFrom(
            address(this),
            msg.sender,
            fracNFTs[fracNFTId].nftTokenId
        );
        emit Redeemed(msg.sender, fracNFTId);
    }

    /// @notice Allows a holder of the ERC20 tokens to claim his share of the sale proceedings (in ether) following a buyout of the fractionalized NFT.
    /// @param fracNFTId The ID of the fractionalized NFT to claim a payout for.
    /// @dev Note, the ERC20 must be approved for transfer by the FractionalizeNFT contract before calling claim().
    function claim(uint256 fracNFTId) public {
        require(
            fracNFTs[fracNFTId].state == State.BoughtOut,
            "Fractionalized NFT has not been bought out."
        );
        ERC20 erc20 = ERC20(fracNFTs[fracNFTId].erc20Address);
        uint256 claimerBalance = erc20.balanceOf(msg.sender);
        require(claimerBalance > 0, "Claimer does not hold any tokens.");
        erc20.transferFrom(msg.sender, address(this), claimerBalance);
        uint256 erc20Supply = erc20.totalSupply();
        uint256 claimAmountWei = (fracNFTs[fracNFTId].buyoutPrice *
            claimerBalance) / erc20Supply;
        payable(msg.sender).transfer(claimAmountWei);
        emit Claimed(msg.sender, fracNFTId);
    }

    /// @notice Allows an account to buy the NFT from the contract for the specified buyout price.
    /// @param fracNFTId The ID of the fractionalized NFT to buy.
    function buyout(uint256 fracNFTId) public payable {
        // A buyer can buy the NFT as specified by the buyout price by sending ETH to the contract.
        require(
            msg.value >= fracNFTs[fracNFTId].buyoutPrice,
            "Sender sent less than the buyout price."
        );
        fracNFTs[fracNFTId].state = State.BoughtOut;
        ERC721 erc721 = ERC721(fracNFTs[fracNFTId].erc721Address);
        erc721.safeTransferFrom(
            address(this),
            msg.sender,
            fracNFTs[fracNFTId].nftTokenId
        );
        emit BoughtOut(msg.sender, fracNFTId);
    }

    /// @dev Required to use safeTransferFrom() from OpenZeppelin's ERC721 contract (when transferring NFTs to this contract).
    function onERC721Received(
        address operator,
        address from,
        uint256 nftTokenId,
        bytes memory data
    ) public returns (bytes4) {
        emit NftReceived(msg.sender);
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }
}
