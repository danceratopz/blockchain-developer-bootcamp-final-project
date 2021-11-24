import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useContract } from '../hooks/useContract';
import { shortenAddress } from '../utils/shortenAddress';
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
  const _account = account;
  return (<span style={{ fontFamily: "Courier New" }}>{shortenAddress(_account)}</span>);
};

const FilteredListing = ({ fractionalizeNftAddress, listings, fracNftState, action }) => {
  const { active, account, library } = useWeb3React();
  let [filteredByHolder, setFilteredByHolder] = useState([]);
  let accountHoldsEnoughErc20Tokens = new Array(listings.length)
  const desiredFracNftState = fracNftState
  const _action = action

  const holdsEnoughErc20Tokens = useCallback(async (action, account, library, erc20Address) => {
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
    let filtered = listings.filter((l) => l.state === fracNftState);
    if (action === "redeem" || action === "payout") {
      let accountHoldsEnoughErc20TokensForAction = new Array(listings.length)
      for (let i = 0; i < listings.length; i++) {
        accountHoldsEnoughErc20TokensForAction[i] = await holdsEnoughErc20Tokens(action, account, library, listings[i].erc20Address);
      }
      filtered = filtered.filter((l) => accountHoldsEnoughErc20TokensForAction[l.fracNFTId]);
    } else {
      console.log("Error: unexpected action: '", action, "'")
    }
    setFilteredByHolder(filtered)
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
      return (<NoListings message={["No redemptions are available for the account ", <StyledAddress account={account} />]} />);
    } else if (action == "payout") {
      return (<NoListings message={["No payouts are available for the account ", <StyledAddress account={account} />]} />);
    }
  }

  return (
    <StyledDiv>
      {filteredByHolder.map((l) => {
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
  const { active, library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress;
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
  const desiredFracNftState = fracNftState;

  const onBuyNftClick = async (fracNFTId, buyoutPrice) => {
    console.log("onBuyNftClick " + fracNFTId)
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

  const onRedeemNftClick = async (fracNFTId) => {
    console.log("onRedeemNftClick " + fracNFTId)
    try {
      setStatus(InteractionState.LOADING);
      const transaction = await contract.redeem(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(InteractionState.SOLD);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError("Error - " + e.message) // + ": " + e.data.message);
      }
    }
  };

  // {item.state === 1 && item.originalOwner && <Text center>Fractionalized by: {shortenAddress(item.originalOwner)}</Text>}
  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {status === InteractionState.ERROR && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }} color={colors.red}>
            {mmError || 'Error encountered!'}
          </Text>
        </>
      )}
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

            </StyledItemTextContainer>
          </StyledItem>
        </div>
      </FractFieldset>
    </Container>
  );
};

// {(action === "redeem" && item.state === desiredFracNftState && txHash === 'undefined') && (
//   <StyledItem>
//     <ConnectBtn
//       style={{ width: "150px" }}
//       onClick={() => onRedeemNftClick(item.fracNFTId)}
//       type="submit"
//       name="approveErc20ForRedemption">
//       Approve
//     </ConnectBtn>
//     <ConnectBtn
//       style={{ width: "150px" }}
//       onClick={() => onRedeemNftClick(item.fracNFTId)}
//       type="submit"
//       name="buyNft">
//       Redeem
//     </ConnectBtn>
//   </StyledItem>)}

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
