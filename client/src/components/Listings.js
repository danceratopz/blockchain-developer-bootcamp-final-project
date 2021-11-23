import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract } from 'ethers';
import { formatEther } from '@ethersproject/units';
import Text from './Text';
import { useContract } from '../hooks/useContract';
import { shortenAddress } from '../utils/shortenAddress';
import { colors } from '../theme';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';


const listingState = {
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

const InteractionState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  SOLD: 'SOLD',
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

const BuyButton = styled(Button).attrs({ variant: 'outline-success' })

const ConnectBtn = styled.button`
  border: 1px solid ${colors.blue};
  background: transparent;
  color: white;
  border-radius: 5px;
  margin: 5px;
`;

const FractInput = styled.input`
  border: 1px solid ${colors.blue};
  background: ${colors.blue};
  width: 250px
  color: white;
  border-radius: 5px;
  margin: 5px;
`;

const FractFieldset = styled.fieldset`
  border: 1px solid ${colors.blue};
  background: #1f1f1f;
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
`;

const FilteredListing = ({ fractionalizeNftAddress, listings, fracNftState, action }) => {
  const filtered = listings.filter((l) => l.state === fracNftState);
  const { account } = useWeb3React();
  const desiredFracNftState = fracNftState
  const _action = action

  if (filtered.length < 1) {
    if (fracNftState === "buyout") {
      return (
        <Text style={{ display: "inline-block" }} color="red" center>
          There are currently no fractionalized NFTs in the contract to buy.
        </Text>
      );
    } else if (fracNftState === "redeem") {
      return (
        <Text style={{ display: "inline-block" }} color="red" text-align="center">
          No redemptions are available for the account <span style={{ fontFamily: "Courier New" }}>{shortenAddress(account)}</span>.
        </Text>
      );
    } else if (fracNftState == "payout") {
      return (
        <Text style={{ display: "inline-block" }} color="red" text-align="center">
          No payouts are available for the account <span style={{ fontFamily: "Courier New" }}>{shortenAddress(account)}</span>.
        </Text>
      );
    }
  }

  return (
    <StyledDiv>
      {filtered.map((l) => {
        const id = BigNumber.from(l.fracNFTId).toNumber();
        return <ListingItem fractionalizeNftAddress={fractionalizeNftAddress} key={id} item={l} fracNftState={desiredFracNftState} action={_action} />;
      })}
    </StyledDiv>
  );
};


const ListingItem = ({ fractionalizeNftAddress, item, fracNftState, action }) => {
  const { fracNFTId, nftTokenId, erc721Address, erc20Address, erc20Name, erc20Symbol, buyoutPrice: amount, imgUrl } = item;

  const [status, setStatus] = useState(InteractionState.READY);
  const [mmError, setMmError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [txHash, setTxHash] = useState('undefined');
  const { active, library, account } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress;
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
  const desiredFracNftState = fracNftState;
  const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
  const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];
  const erc20 = new Contract(erc20Address, abi, signerOrProvider);
  const _action = action

  const userHoldsErc20 = async () => {
    const balance = 100
    return balance ? 1 : 0;
  };

  const onBuyNftClick = async (fracNFTId, buyoutPrice) => {
    console.log("onFractionalizeNftClick " + fracNFTId)
    try {
      setStatus(InteractionState.LOADING);
      const transaction = await contract.buyout(fracNFTId, { from: account, value: buyoutPrice });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(InteractionState.SOLD);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError("Error calling fractionalizeNFT() - " + e.message) // + ": " + e.data.message);
      }
    }
  };

  // {item.state === 1 && item.originalOwner && <Text center>Fractionalized by: {shortenAddress(item.originalOwner)}</Text>}
  return (
    <FractFieldset>
      <div>
        <StyledItem>
          <StyledItemTextContainer>
            <Text center>{erc20Name}</Text>
            <Text center style={{ fontFamily: "Source Code Pro" }}>ERC721: {shortenAddress(erc721Address)}</Text>
            <Text center>Token Id: {BigNumber.from(nftTokenId).toNumber()}</Text>
            <Text center bold color={colors.blue}>
              {formatEther(amount)} ETH
            </Text>
            {action === "buyout" && item.state === desiredFracNftState && txHash === 'undefined' && (
              <StyledItem>
                <ConnectBtn
                  style={{ width: "150px" }}
                  onClick={() => onBuyNftClick(item.fracNFTId, item.buyoutPrice)}
                  type="submit"
                  name="buyNft">
                  Buy
                </ConnectBtn>
              </StyledItem>)}
            {(action === "buyout" && item.state === desiredFracNftState && txHash !== 'undefined') && (
              <StyledItem>
                <ConnectBtn
                  style={{ width: "150px", border: "1px solid " + colors.green }}
                  disabled="1"
                  type="submit"
                  name="buyNft">
                  <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
                </ConnectBtn>
              </StyledItem>)}
            {(action === "redeem" && item.state === desiredFracNftState && txHash === 'undefined') && (
              <StyledItem>
                <ConnectBtn
                  style={{ width: "150px" }}
                  onClick={() => onBuyNftClick(item.fracNFTId, item.buyoutPrice)}
                  type="submit"
                  name="buyNft">
                  Redeem
                </ConnectBtn>
              </StyledItem>)}

          </StyledItemTextContainer>
        </StyledItem>
      </div>
    </FractFieldset>
  );
};


const Listings = ({ fractionalizeNftAddress, fracNftState, action }) => {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(listingState.LOADING);
  const { active } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
  const desiredFracNftState = fracNftState
  const _action = action

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
      <FilteredListing fractionalizeNftAddress={fractionalizeNftAddress} listings={listings} fracNftState={desiredFracNftState} action={_action} />
    </>
  );
};

export default Listings;
