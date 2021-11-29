import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Link, Redirect } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { useFractionalizeNft } from '../hooks/useFractionalizeNft';
import useTransaction from '../hooks/useTransaction';
import { KnownNftContracts } from '../components/KnownNftContracts'
import Text from '../components/Text';
import { StyledAddress, StyledTxn } from './StyledAddress';

import { Contract } from '@ethersproject/contracts';
import { ethers, BigNumber } from "ethers";
import { shortenAddress } from '../utils/shortenAddress';
import { TransactionState } from  '../utils/states';
import { colors } from '../theme';
import { ConnectBtn, FractFieldset, Legend, FractInput } from './StyledHelpers';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';
import exampleErc721Contract from '../artifacts/contracts/TestNFT.json';

const CONFIRMATION_COUNT = 1;

const BuyButton = styled(Button).attrs({ variant: 'outline-success' })

const InteractionState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  APPROVED: 'APPROVED',
  FRACTIONALIZED: 'FRACTIONALIZED',
  ERROR: 'ERROR',
};

function isPositiveFloat(str) {
  // see https://stackoverflow.com/a/10834843
  var n = Number(str);
  return n !== Infinity && String(n) === str && n >= 0;
}

function isPositiveInteger(str) {
  // see https://stackoverflow.com/a/10834843
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

const FractionalizeNft = ({ fractionalizeNftAddress }) => {
  const [status, setStatus] = useState(InteractionState.READY);
  const { txnStatus, setTxnStatus } = useTransaction();
  const [mmError, setMmError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [nftContractAddress, setNftContractAddress] = useState("")
  const [nftTokenIndex, setNftTokenIndex] = useState("")
  const [erc20Name, setErc20Name] = useState("")
  const [erc20Symbol, setErc20Symbol] = useState("")
  const [erc20Supply, setErc20Supply] = useState("")
  const [buyoutPrice, setBuyoutPrice] = useState("")
  const { active, library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);

  const [windowDimension, setWindowDimension] = useState(null);
  useEffect(() => {
    setWindowDimension(window.innerWidth);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  const isMobile = windowDimension < 600
  const addressInputWidth = isMobile ? "330px" : "460px";
  const tokenIdInputWidth = isMobile ? "120px" : "120px";
  const miscInputWidth = isMobile ? "290px" : "290px";

  const onApproveNftClick = async () => {
    setTxnStatus(TransactionState.PENDING);
    setStatus(InteractionState.LOADING);
    console.log("onApproveNftClick")
    try {
      setStatus(InteractionState.WAITING);
      const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
      const nftContract = new Contract(nftContractAddress, exampleErc721Contract.abi, signerOrProvider);
      const transaction = await nftContract.approve(
        fractionalizeNftContractAddress,
        nftTokenIndex,
        {from: account});
      console.log("sent")
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(InteractionState.APPROVED);
      setTxnStatus(TransactionState.SUCCESS);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        let message
        if ( e.hasOwnProperty('data') && e.data.hasOwnProperty('message')) {
          message = "Error calling fractionalizeNFT() - " + e.message + ": " + e.data.message
        } else {
          message = "Error calling fractionalizeNFT() - " + e.message
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
  }

  const onFractionalizeNftClick = async () => {
    setTxnStatus(TransactionState.PENDING);
    setStatus(InteractionState.LOADING);
    console.log("onFractionalizeNftClick")
    try {
      setStatus(InteractionState.WAITING);
      const transaction = await contract.fractionalizeNft(
        nftContractAddress,
        nftTokenIndex,
        erc20Name,
        erc20Symbol,
        ethers.utils.parseUnits(erc20Supply, 18),  // Our ERC20Factory uses OpenZeppelin's default of 18 digits.
        ethers.utils.parseEther(buyoutPrice),
        {from: account});
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(InteractionState.FRACTIONALIZED);
      setTxnStatus(TransactionState.SUCCESS);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        let message
        if ( e.hasOwnProperty('data') && e.data.hasOwnProperty('message')) {
          message = "Error calling fractionalizeNFT() - " + e.message + ": " + e.data.message
        } else {
          message = "Error calling fractionalizeNFT() - " + e.message
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
  };

  // Respond to 'Fractionalized' event emitted from smart contract.
  contract.on("Fractionalized", (address, fracNftId) => {
    console.log("Got fractionalized event! ", address, " ", BigNumber.from(fracNftId).toNumber())
    if (address != account) {
      console.log("Event address did not match the logged in account")
      return;
    }
    // setNewlyCreatedFracNftId(fracNftId);
    // setNewlyCreatedFracNftErc20Address();
    // setNewlyCreatedFracNftErc20Symbol(fracNftId);
  });

  if (!active) return <Redirect to="/" />;

  const { LOADING, WAITING, READY, APPROVED, FRACTIONALIZED, ERROR } = InteractionState;

  if (!active) return;

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {(status === READY ||
        status === APPROVED ||
        status === FRACTIONALIZED ||
        status === LOADING ||
        status === ERROR) && (
      <FractFieldset>
        <legend style={{ float: "left" }}>
          Fractionalize an NFT
        </legend>
        <Text style={{ display: "inline-block" }}>
          Fractionalize an ERC721 NFT into an ERC20 token - the fractionalizing account receives the total supply.
        </Text>
        <FractFieldset>
          <legend style={{ float: "left" }}>
            Approve</legend>
        <Text style={{ display: "inline-block" }}>
            Approve the FractionalizeNFT contract to take ownership of the NFT.
          </Text>
          <br />
            <FractInput
           style={ nftContractAddress.length != 42 ? {width: addressInputWidth, border: "1px solid " + colors.red} : {width: addressInputWidth}}
            name="nftContractAddress"
            placeholder="NFT contract address (string, 0x...)"
            type="text"
            list="knownNftContracts"
            value={nftContractAddress}
            onChange={(e) => setNftContractAddress(e.target.value)}
            />
          <KnownNftContracts/>
          <FractInput
            style={ !isPositiveInteger(nftTokenIndex) ? {width: tokenIdInputWidth, border: "1px solid " + colors.red} : {width: tokenIdInputWidth}}
            name="nftTokenIndex"
            placeholder="Token Index (int)"
            type="text"
            value={nftTokenIndex}
            onChange={(e) => setNftTokenIndex(e.target.value)}
            />
            {(status != APPROVED && status != ERROR) && (
              <ConnectBtn
              style={ !isPositiveInteger(nftTokenIndex) ? {border: "1px solid white", width: "200px"} : {width: "200px"}}
               disabled={ !isPositiveInteger(nftTokenIndex) }
               onClick={onApproveNftClick}
               type="submit"
               name="approveNft">
               Approve
              </ConnectBtn>)}
          {(status === ERROR) && (
            <>
              <ConnectBtn
              style={ !isPositiveInteger(nftTokenIndex) ? {border: "1px solid white", width: "200px"} : {border: "1px solid " + colors.red, width: "200px"}}
              disabled={ !isPositiveInteger(nftTokenIndex) }
               onClick={onApproveNftClick}
               type="submit"
               name="approveNft">
                Approve
              </ConnectBtn>
              <Text>(see error below)</Text>
            </>)}
             {(status === APPROVED && txHash ) && (
               <ConnectBtn
               style={{border: "1px solid " + colors.green, width: "200px"}}
                    disabled="1"
                    type="submit"
                    name="buyNft">
                      <StyledTxn hash={txHash}/>
                  </ConnectBtn>)}

        </FractFieldset>
        <FractFieldset>
          <legend style={{ float: "left" }}>
            Fractionalize
          </legend>
          <Text style={{ display: "inline-block" }}>
            Specify the parameters of the ERC20 token that will represent partial ownership of the NFT.
            <br />
            The buyout price specifies the price at which the NFT may be bought from the contract by a third party from the Market.
          </Text>
          <form>
            <div>
              <FractInput
                style={ erc20Name.length === 0 ? {width: miscInputWidth, border: "1px solid " + colors.red} : {width: miscInputWidth}}
                name="erc20Name"
                placeholder="ERC Token Name (string)"
                type="text"
                value={erc20Name}
                onChange={(e) => setErc20Name(e.target.value)}
              />
              <FractInput
                style={ erc20Symbol.length === 0 ? {width: miscInputWidth, border: "1px solid " + colors.red} : {width: miscInputWidth}}
                name="erc20Symbol"
                placeholder="ERC Token Symbol (string)"
                type="text"
                value={erc20Symbol}
                onChange={(e) => setErc20Symbol(e.target.value)}
              />
              <br />
              <FractInput
                style={ !isPositiveInteger(erc20Supply) ? {width: miscInputWidth, border: "1px solid " + colors.red} : {width: miscInputWidth}}
                name="erc20Supply"
                placeholder="ERC Token Supply (int)"
                type="text"
                value={erc20Supply}
                onChange={(e) => setErc20Supply(e.target.value)}
              />
            <FractInput
                style={ !isPositiveFloat(buyoutPrice) ? {width: miscInputWidth, border: "1px solid " + colors.red} : {width: miscInputWidth}}
                name="buyoutPrice"
                placeholder="Buyout Price (Ether)"
                type="text"
                value={buyoutPrice}
                onChange={(e) => setBuyoutPrice(e.target.value)}
            />
            { (status != FRACTIONALIZED) && (
            <ConnectBtn
          style={ !isPositiveInteger(nftTokenIndex) || erc20Name.length === 0 || erc20Symbol.length === 0 || !isPositiveInteger(erc20Supply) || !isPositiveFloat(buyoutPrice) ? {width: "200px", border: "1px solid white" } : {width: "200px"} }
          disabled={ !isPositiveInteger(nftTokenIndex) || erc20Name.length === 0 || erc20Symbol.length === 0 || !isPositiveInteger(erc20Supply) || !isPositiveFloat(buyoutPrice) }
                onClick={onFractionalizeNftClick}
                type="submit"
                name="fractionalize">
                Fractionalize
              </ConnectBtn>)}
          { (status === FRACTIONALIZED ) && txHash && (
                <ConnectBtn
              style={{border: "1px solid " + colors.green, width: "200px"}}
              onClick={onFractionalizeNftClick}
              disabled="1"
                type="submit"
                name="fractionalize">
                <StyledTxn hash={txHash}/>
              </ConnectBtn>)}
            </div>
          </form>
        </FractFieldset>
            </FractFieldset>
      )}
      {status === LOADING ||
        (status === WAITING && (
          <>
            <Spinner
              animation="border"
              size="sm"
              style={{ color: colors.green, marginTop: '20px', marginBottom: '20px' }}
            />
            {status === WAITING && <Text>Waiting for the transaction to confirm.</Text>}
          </>
        ))}
      {status === APPROVED && !!txHash && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }}>
          NFT was successfully approved for transfer in transaction <StyledTxn hash={txHash}/>
          </Text>
          </>
      )}
      {status === FRACTIONALIZED && !!txHash && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }}>
          NFT was successfully fractionalized in transaction  <StyledTxn hash={txHash}/>
          </Text>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }}>
          The fractionalized NFT (and its corresponding ERC20 address) can now be found on the <Link style={{ color: colors.blue }} to="/Market">Market</Link> and <Link style={{ color: colors.blue }} to="/Redeem">Redeem</Link> Redeem pages.
          </Text>
        </>
      )}
      {status === ERROR && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }} color={colors.red}>
          {mmError || 'Unknown error encountered! Please reload.'}
          </Text>
        </>
      )}
      </Container>
  );
};

export default FractionalizeNft;
