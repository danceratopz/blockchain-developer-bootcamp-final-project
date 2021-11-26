import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useContract } from '../hooks/useContract';
import useTransaction from '../hooks/useTransaction';
import { shortenAddress } from '../utils/shortenAddress';
import { TransactionState } from  '../utils/states';
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

const FilteredListing = ({ fractionalizeNftAddress, listings, action }) => {
  const { active, account, library } = useWeb3React();
  let [filteredByHolder, setFilteredByHolder] = useState([]);
  let accountHoldsEnoughErc20Tokens = new Array(listings.length)
  const _action = action

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
        return <ListingItem fractionalizeNftAddress={fractionalizeNftAddress} key={id} item={l} action={_action} />;
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
      console.log(e)
      if (e.code && typeof e.code === 'number') {
        setTxnStatus(TransactionState.FAIL);
        setMmError("Error calling fractionalizeNFT() - " + e.message)
      } else {
        setTxnStatus(TransactionState.ERROR);
      }
    }
  };

  const onRedeemNftClick = async (fracNFTId) => {
    console.log("onRedeemNftClick " + fracNFTId)
    try {
      setTxnStatus(TransactionState.PENDING);
      const transaction = await contract.redeem(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setTxnStatus(TransactionState.FAIL);
        setMmError("Error - " + e.message)
      } else {
        setTxnStatus(TransactionState.ERROR);
      }
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
        {from: account});
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setTxnStatus(TransactionState.SUCCESS);
      setErc20ApprovalStatus(Erc20ApprovalState.APPROVED);
    } catch (e) {
      console.log(e)
      if (e.code && typeof e.code === 'number') {
        setMmError("Error - " + e.message);
        setTxnStatus(TransactionState.FAIL);
      } else {
        setTxnStatus(TransactionState.ERROR);
      }
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
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError("Error - " + e.message)
        setTxnStatus(TransactionState.FAIL);
      } else {
        setTxnStatus(TransactionState.ERROR);
      }
    }
  };

  const isErc20Approved = async (fracNFTid) => {
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
    // <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
  return (
    <>
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
                </StyledItem>)}
                 {(action === "redeem" && txHash !== 'undefined') && (
                <StyledItem>
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

                {(action === "payout" && status === InteractionState.APPROVED && txHash !== 'undefined') && (
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
              {(action === "payout" && status === InteractionState.SOLD && txHash !== 'undefined') && (
                <StyledItem>
                  <ConnectBtn
                    style={{ width: "150px" }}
                    onClick={() => onApproveErc20Click(item.fracNFTId)}
                    type="submit"
                    name="onApproveErc20Click">
                    Approve
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
              //    <ConnectBtn
              //       style={{ width: "150px" }}
              //       onClick={() => onRedeemNftClick(item.fracNFTId)}
              //       type="submit"
              //       name="reddemNft">
              //       Redeem
              //     </ConnectBtn>
              //     </StyledItem>)}

              //   {(action === "redeem" && {status === InteractionState.APPROVED && txHash !== 'undefined') && (
              //   <StyledItem>
              //     <ConnectBtn
              //       style={{ width: "150px", border: "1px solid " + colors.green }}
              //       disabled="1"
              //       type="submit">
              //     <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
              //     </ConnectBtn>
              //     <ConnectBtn
              //       style={{ width: "150px" }}
              //       onClick={() => onRedeemNftClick(item.fracNFTId)}
              //       type="submit"
              //       name="reddemNft">
              //       Redeem
              //     </ConnectBtn>
              //   </StyledItem>)}
              // {(action === "redeem" && status === InteractionState.SOLD && txHash !== 'undefined') && (
              //   <StyledItem>
              //     <ConnectBtn
              //       style={{ width: "150px" }}
              //       onClick={() => onApproveErc20Click(item.fracNFTId)}
              //       type="submit"
              //       name="onApproveErc20Click">
              //       Approve
              //     </ConnectBtn>
              //     <ConnectBtn
              //       style={{ width: "150px", border: "1px solid " + colors.green }}
              //       disabled="1"
              //       type="submit">
              //     <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
              //     </ConnectBtn>
              //   </StyledItem>)}

const Listings = ({ fractionalizeNftAddress, action }) => {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(listingState.LOADING);
  const { active } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
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
      <FilteredListing fractionalizeNftAddress={fractionalizeNftAddress} listings={listings} action={_action} />
    </>
  );
};

export default Listings;
