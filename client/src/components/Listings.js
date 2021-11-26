import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useContract } from '../hooks/useContract';
import useTransaction from '../hooks/useTransaction';
import { shortenAddress } from '../utils/shortenAddress';
import { TransactionState } from '../utils/states';
import Text from './Text';
import styled from 'styled-components';
import { FractFieldset, NoFractFieldset, Legend, ConnectBtn } from './StyledHelpers';
import { colors } from '../theme';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';

const listingState = {
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

const Erc20ApprovalState = {
  UNKNOWN: 'UNKNOWN',
  APPROVED: 'APPROVED',
  NOT_APPROVED: 'NOT_APPROVED',
}

const InteractionState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  APPROVED: 'APPROVED',
  SOLD: 'SOLD',
  ACTION_COMPLETE: 'ACTION_COMPLETE',  
  ERROR: 'ERROR',
};

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  max-width: 90%;
  flex-wrap: wrap;
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  max-width: 175px;
`;

const StyledItemTextContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`;


var getJSON = function(url, callback) {
    // https://stackoverflow.com/a/35970894
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

const BuyButton = styled(Button).attrs({ variant: 'outline-success' })

const NoListings = ({ message }) => {
  return (
    <StyledDiv>
      <NoFractFieldset>
        <Text color={colors.secondary} text-align="center">
          {message}
        </Text>
      </NoFractFieldset>
    </StyledDiv>
  );
};

const StyledAddress = ({ account }) => {
  return (<span style={{ fontFamily: "Courier New" }}>{shortenAddress(account)}</span>);
};

const FilteredListing = ({ fractionalizeNftAddress, listings, action }) => {
  const { active, account, library } = useWeb3React();
  let [filteredByHolder, setFilteredByHolder] = useState([]);
  let accountHoldsEnoughErc20Tokens = new Array(listings.length)

  const holdsEnoughErc20TokensForAction = useCallback(async (account, action, library, erc20Address) => {
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
    ];
    const signerOrProvider = library
    const erc20 = new Contract(erc20Address, abi, signerOrProvider);
    const balance = BigNumber.from(await erc20.balanceOf(account)).toNumber()

    if (action === "redeem") {
      const totalSupply = await BigNumber.from(await erc20.totalSupply()).toNumber()
      return balance === totalSupply;
    } else if (action === "payout") {
      return balance > 0;
    } else {
      console.log("Error: unexpected action: '", action, "'")
    }
  }, []);

  const filterListings = useCallback(async (action, listings) => {
    let requiredState
    if (action === "buyout" || action === "redeem") {
      requiredState = 0;  // fractionalized
    } else if (action === "payout") {
      requiredState = 2;  // boughtout
    } else {
      console.log("Error: unexpected action: '", action, "'")
    }
    let filtered = listings.filter((l) => l.state === requiredState);
    // Anyone can buyout an NFT, but only holders of the fractionalized NFT's ERC20 can either redeem (account holds
    // total supply) or claim (account's balance > 0). So here we additionally filter the listings using the account's
    // corresponding ERC20 balances.
    // if (action === "buyout") {
    //  filtered = listings.filter((l) => l.originalOwner != account);
    if (action === "redeem" || action === "payout") {
      let accountHoldsEnoughErc20TokensForAction = new Array(listings.length)
      for (let i = 0; i < listings.length; i++) {
        accountHoldsEnoughErc20TokensForAction[i] = await holdsEnoughErc20TokensForAction(account, action, library, listings[i].erc20Address);
      }
      filtered = filtered.filter((l) => accountHoldsEnoughErc20TokensForAction[l.fracNFTId]);
      setFilteredByHolder(filtered)      
    } else if (action === "buyout") {
      setFilteredByHolder(filtered)
    } else {
      console.log("Error: unexpected action: '", action, "'")
    }

  }, []);

  useEffect(() => {
    if (active) {
      filterListings(action, listings);
    }
  }, [active]);

  if (filteredByHolder.length < 1) {
    if (action === "buyout") {
      return (<NoListings message={"There are currently no fractionalized NFTs in the contract to buy."} />);
    } else if (action === "redeem") {
      return (<NoListings message={["No redemptions are available for the account ", <StyledAddress key="redeem" account={account} />]} />);
    } else if (action == "payout") {
      return (<NoListings message={["No payouts are available for the account ", <StyledAddress key="payout" account={account} />]} />);
    }
  }

  return (
    <StyledDiv>
      {filteredByHolder.map((l) => {
        const id = BigNumber.from(l.fracNFTId).toNumber();
        return <ListingItem fractionalizeNftAddress={fractionalizeNftAddress} key={id} item={l} action={action} />;
      })}
    </StyledDiv>
  );
};


const ListingItem = ({ fractionalizeNftAddress, item, action }) => {
  const { fracNFTId, nftTokenId, erc721Address, erc20Address, erc20Name, erc20Symbol, buyoutPrice: amount, imgUrl } = item;

  const [status, setStatus] = useState(InteractionState.READY);
  const [erc20ApprovalStatus, setErc20ApprovalStatus] = useState(Erc20ApprovalState.UNKNOWN);
  const [mmError, setMmError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [txHash, setTxHash] = useState('undefined');
  const { txnStatus, setTxnStatus } = useTransaction();
  const { active, library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress;
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
  const [imageUrl, setImageUrl] = useState(null)
  const [imageAltText, setImageAltText] = useState("")

  const processTxnError = (e) => {
    console.log(e)
    setStatus(InteractionState.ERROR);
    if (e.code && typeof e.code === 'number') {
      let message
      if (e.hasOwnProperty('data') && e.data.hasOwnProperty('message')) {
        message = "Error - " + e.message + ": " + e.data.message
      } else {
        message = "Error - " + e.message
      }
      setTxnStatus(TransactionState.FAIL);
      setMmError(message)
    } else if (e.hasOwnProperty('message')) {
      setTxnStatus(TransactionState.ERROR);
      setMmError(e.message)
    } else {
      setTxnStatus(TransactionState.ERROR);
    }
  }

  const onBuyNftClick = async (fracNFTId, buyoutPrice) => {
    console.log("onBuyNftClick " + fracNFTId)
    try {
      setTxnStatus(TransactionState.PENDING);
      const transaction = await contract.buyout(fracNFTId, { from: account, value: buyoutPrice });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
    } catch (e) {
      processTxnError(e);
    }
  };

  const onRedeemNftClick = async (fracNFTId) => {
    console.log("onRedeemNftClick, fracNFTId " + fracNFTId)
    try {
      setTxnStatus(TransactionState.PENDING);
      const transaction = await contract.redeem(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
      setStatus(InteractionState.ACTION_COMPLETE);      
    } catch (e) {
      processTxnError(e);
    }
  };

  const onApproveErc20Click = async (fractNFTId) => {
    console.log("onApproveErc20Click " + fracNFTId)
    try {
      setTxnStatus(TransactionState.PENDING);
      const abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address owner, uint256 amount) returns (bool)",
      ];
      const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
      const erc20 = new Contract(erc20Address, abi, signerOrProvider);
      const balance = BigNumber.from(await erc20.balanceOf(account)).toNumber()
      console.log(balance)
      const transaction = await erc20.approve(
        fractionalizeNftContractAddress,
        balance,
        { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
      setErc20ApprovalStatus(Erc20ApprovalState.APPROVED);
      console.log("erc20ApprovalStatus: ", erc20ApprovalStatus, "txhash: ", txHash)
    } catch (e) {
      processTxnError(e);
    }
  };

  const onPayoutClick = async (fractNFTId) => {
    console.log("onPayoutClick " + fracNFTId)
    try {
      setTxnStatus(TransactionState.PENDING);
      const transaction = await contract.claim(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
      setStatus(InteractionState.ACTION_COMPLETE);
    } catch (e) {
      processTxnError(e);
    }
  };

  const isErc20Approved = async (fracNFTid) => {

    // CURRENTLY UNUSED
    
    try {
      const abi = [
        "function allowance(address owner, address spender) view returns (bool)"
      ];
      const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
      const erc20 = new Contract(erc20Address, abi, signerOrProvider);
      const approved = await erc20.balanceOf(account, fractionalizeNftContractAddress)
      console.log(approved)
      // const transaction = await erc20.approve(
      //   fractionalizeNftContractAddress,
      //   balance,
      //   {from: account});
      // const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      // await transaction.wait(confirmations);
      // setTxHash(transaction.hash);
      if (approved) {
        setErc20ApprovalStatus(Erc20ApprovalState.APPROVED);
      } else {
        setErc20ApprovalStatus(Erc20ApprovalState.NOT_APPROVED);
      }
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError("Error - " + e.message) // + ": " + e.data.message);
      }
    }
  };

  const nftImage = useCallback(async () => {
    // TODO This requires optimisation
    const abi = [
      "function tokenURI(uint256 id) view returns (string)",
    ];
    const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
    const erc721Contract = new Contract(erc721Address, abi, signerOrProvider);
    const jsonUri = await erc721Contract.tokenURI(BigNumber.from(nftTokenId).toNumber())

    getJSON(jsonUri, function(err, data) {
      if (err !== null) {
        setImageUrl(null)                  
        setImageAltText("Error retrieving image")        
      } else {
        if (data !== null) {
          setImageUrl(data.image)
          setImageAltText("NFT Image")
        } else {
          console.log(data)
          setImageUrl(null)          
          setImageAltText("Unable to retrieve image")
        }
      }
    });
    console.log('nft id: ' + nftTokenId +  ', imageUrl: ' + imageUrl);
  }, []);
  
  nftImage();
  
  const NftImage = () => {

    return (
        <img src={imageUrl} style={{ height: '150px',
                                       width: '100%',
                                       borderRadius: '5px',
                                       border: "1px solid " + colors.blue,
                                       fontFamily: "Source Sans Pro",
                                       textAlign: "center" }} alt={imageAltText}/>
    );
  }
  
  return (
    <>
      {status === InteractionState.ERROR && (
        <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
          <Text style={{ marginTop: '20px', marginBottom: '20px' }} color={colors.red}>
            {mmError || 'Unknown error encountered! Please reload.'}
          </Text>
        </Container>
      )}
      <FractFieldset>
        <div>
          <StyledItem>
            <StyledItemTextContainer>
              <Text center>{erc20Name}</Text>
              <NftImage fracNftId={item.fracNftId} />
              <Text center style={{ fontFamily: "Source Code Pro" }}>ERC721: {shortenAddress(erc721Address)}</Text>
              <Text center>Token Id: {BigNumber.from(nftTokenId).toNumber()}</Text>
              <Text center bold color={colors.blue}>
                {formatEther(amount)} ETH
              </Text>

              {action === "buyout" && txHash === 'undefined' && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onBuyNftClick(item.fracNFTId, item.buyoutPrice)}
                    type="submit"
                    name="buyNft">
                    Buy
                  </ConnectBtn>
                </StyledItem>)}
              {(action === "buyout" && txHash !== 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px", border: "1px solid " + colors.green }}
                    disabled="1"
                    type="submit"
                    name="buyNft">
                    <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                  </ConnectBtn>
                </StyledItem>)}

              {(action === "redeem" && txHash === 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onApproveErc20Click(item.fracNFTId)}
                    type="submit"
                    name="onApproveErc20Click">
                    Approve
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onRedeemNftClick(item.fracNFTId)}
                    type="submit"
                    name="reddemNft">
                    Redeem
                  </ConnectBtn>
                  </StyledItem>)}
               {(action === "redeem" && status != InteractionState.ACTION_COMPLETE && erc20ApprovalStatus === Erc20ApprovalState.APPROVED) && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px", border: "1px solid " + colors.green }}
                    disabled="1"
                    type="submit">
                    <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onRedeemNftClick(item.fracNFTId)}
                    type="submit"
                    name="reddemNft">
                    Redeem
                  </ConnectBtn>
                </StyledItem>)}
              {(action === "redeem" && status === InteractionState.ACTION_COMPLETE && txHash != 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                   style={{border: "1px solid white", width: "150px"}}
                    disabled="1"
                    onClick={() => onApproveErc20Click(item.fracNFTId)}
                    type="submit"
                    name="onApproveErc20Click">
                    Approved
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px", border: "1px solid " + colors.green }}
                    disabled="1"
                    type="submit">
                    <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                  </ConnectBtn>
                </StyledItem>)}


              {(action === "payout" && txHash === 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onApproveErc20Click(item.fracNFTId)}
                    type="submit"
                    name="onApproveErc20Click">
                    Approve
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onPayoutClick(item.fracNFTId)}
                    type="submit"
                    name="reddemNft">
                    Payout
                  </ConnectBtn>
                  </StyledItem>)}
               {(action === "payout" && status != InteractionState.ACTION_COMPLETE && erc20ApprovalStatus === Erc20ApprovalState.APPROVED) && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px", border: "1px solid " + colors.green }}
                    disabled="1"
                    type="submit">
                    <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onPayoutClick(item.fracNFTId)}
                    type="submit"
                    name="reddemNft">
                    Payout
                  </ConnectBtn>
                </StyledItem>)}
              {(action === "payout" && status === InteractionState.ACTION_COMPLETE && txHash != 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                   style={{border: "1px solid white", width: "150px"}}
                    disabled="1"
                    onClick={() => onApproveErc20Click(item.fracNFTId)}
                    type="submit"
                    name="onApproveErc20Click">
                    Approved
                  </ConnectBtn>
                  <ConnectBtn
                    style={{ width: "150px", border: "1px solid " + colors.green }}
                    disabled="1"
                    type="submit">
                    <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                  </ConnectBtn>
                </StyledItem>)}

            </StyledItemTextContainer>
          </StyledItem>
        </div>
      </FractFieldset>
    </>
  );
};

const Listings = ({ fractionalizeNftAddress, action }) => {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(listingState.LOADING);
  const { active } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);

  const getProperties = useCallback(async (contract) => {
    try {
      // still on the lookout for optimal solidity data structures, this ain't it
      const idListLengthBN = await contract.fracNFTCount();
      const idBNs = await Promise.all(Array.from(Array(idListLengthBN.toNumber())).map((_, i) => contract.idList(i)));
      const ids = idBNs.map((n) => n.toNumber());
      const arr = await Promise.all(ids.map((id) => contract.fracNFTs(id)));
      setListings(arr);
      setStatus(listingState.READY);
    } catch (e) {
      console.log('error:', e);
      setStatus(listingState.ERROR);
    }
  }, []);

  useEffect(() => {
    if (active) {
      getProperties(contract);
    }
  }, [active]);

  if (!active) {
    return null;
  }

  if (status === listingState.LOADING) {
    return <Spinner animation="border" size="sm" style={{ color: colors.green, marginTop: '20px' }} />;
  }

  return (
    <>
      <FilteredListing fractionalizeNftAddress={fractionalizeNftAddress} listings={listings} action={action} />
    </>
  );
};

export default Listings;
