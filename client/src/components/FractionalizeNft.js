import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Link, Redirect } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { useFractionalizeNft } from '../hooks/useFractionalizeNft';
import Text from '../components/Text';

import { Contract } from '@ethersproject/contracts';
import { ethers } from "ethers";
import { shortenAddress } from '../utils/shortenAddress';
import { colors } from '../theme';
import { ConnectBtn, FractFieldset, Legend, FractInput } from './StyledHelpers';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';
import exampleErc721Contract from '../artifacts/contracts/TestNFT.json';

const CONFIRMATION_COUNT = 2;

const BuyButton = styled(Button).attrs({ variant: 'outline-success' })

const InteractionState = {
  LOADING: 'LOADING',
  WAITING: 'WAITING_CONFIRMATIONS',
  READY: 'READY',
  APPROVED: 'APPROVED',
  FRACTIONALIZED: 'FRACTIONALIZED',
  ERROR: 'ERROR',
};

const FractionalizeNft = ({ fractionalizeNftAddress }) => {
  const [status, setStatus] = useState(InteractionState.READY);
  const [mmError, setMmError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [nftContractAddress, setNftContractAddress] = useState("0x3f4d004805BcfB46b225b37f5900F1291b227716")
  const [nftTokenIndex, setNftTokenIndex] = useState("")
  const [erc20Name, setErc20Name] = useState("")
  const [erc20Symbol, setErc20Symbol] = useState("")
  const [erc20Supply, setErc20Supply] = useState("")
  const [buyoutPrice, setBuyoutPrice] = useState("")
  const { active, library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);

  const onApproveNftClick = async () => {
    console.log("onApproveNftClick")
    try {
      setStatus(InteractionState.LOADING);
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
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
        if (e.code && typeof e.code === 'number') {
            setMmError("Error calling fractionalizeNFT() - " + e.message)
      } else {
        setPageError(e)
      }
    }
  }

  const onFractionalizeNftClick = async () => {
    console.log("onFractionalizeNftClick")
    try {
      setStatus(InteractionState.LOADING);
      const transaction = await contract.fractionalizeNft(
        nftContractAddress,
        nftTokenIndex,
        erc20Name,
        erc20Symbol,
        erc20Supply,
        ethers.utils.parseEther(buyoutPrice),
        {from: account});
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setTxHash(transaction.hash);
      setStatus(InteractionState.FRACTIONALIZED);
    } catch (e) {
      console.log(e)
      setStatus(InteractionState.ERROR);
      if (e.code && typeof e.code === 'number') {
        setMmError("Error calling fractionalizeNFT() - " + e.message) // + ": " + e.data.message);
      }
    }
  };

  // TODO: Return to about?
  if (!active) return <Redirect to="/" />;

  const { LOADING, WAITING, READY, APPROVED, FRACTIONALIZED, ERROR } = InteractionState;

  if (!active) return;

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {(status === READY ||
        status === APPROVED) && (
      <FractFieldset>
        <legend style={{ float: "left" }}>
          Fractionalize NFT
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
            style={{ width: "410px" }}
            name="nftContractAddress"
            placeholder="NFT contract address (string, 0x...)"
            type="text"
            value={nftContractAddress}
            onChange={(e) => setNftContractAddress(e.target.value)}
          />
          <FractInput
            style={{ width: "120px" }}
            name="nftTokenIndex"
            placeholder="Token Index (int)"
            type="text"
            value={nftTokenIndex}
            onChange={(e) => setNftTokenIndex(e.target.value)}
          />
          <ConnectBtn
            style={{ width: "200px" }}
            onClick={onApproveNftClick}
            type="submit"
            name="approveNft">
            Approve
          </ConnectBtn>
        </FractFieldset>
        <FractFieldset>
          <legend style={{ float: "left" }}>
            Fractionalize
          </legend>
          <Text style={{ display: "inline-block" }}>
            Specify the parameters of the ERC20 token that will represent partial ownership of the NFT.
            <br />
            The buyout price specifies the price at which the NFT may be bought from the contract by a third party.
          </Text>
          <form>
            <div>
              <FractInput
                style={{ width: "265px" }}
                name="erc20Name"
                placeholder="ERC Token Name (string)"
                type="text"
                value={erc20Name}
                onChange={(e) => setErc20Name(e.target.value)}
              />
              <FractInput
                style={{ width: "265px" }}
                name="erc20Symbol"
                placeholder="ERC Token Symbol (string)"
                type="text"
                value={erc20Symbol}
                onChange={(e) => setErc20Symbol(e.target.value)}
              />
              <br />
              <FractInput
                style={{ width: "265px" }}
                name="erc20Supply"
                placeholder="ERC Token Supply (int)"
                type="text"
                value={erc20Supply}
                onChange={(e) => setErc20Supply(e.target.value)}
              />
              <FractInput
                style={{ width: "265px" }}
                name="buyoutPrice"
                placeholder="Buyout Price (Ether)"
                type="text"
                value={buyoutPrice}
                onChange={(e) => setBuyoutPrice(e.target.value)}
              />
              <ConnectBtn
                style={{ width: "200px" }}
                onClick={onFractionalizeNftClick}
                type="submit"
                name="fractionalize">
                Fractionalize
              </ConnectBtn>
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
          <Text t2 color={colors.green} style={{ marginTop: '20px', marginBottom: '20px' }}>
          NFT was successfully approved for transfer in transaction <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
          </Text>
        </>
      )}
      {status === FRACTIONALIZED && !!txHash && (
        <>
          <Text t2 color={colors.green} style={{ marginTop: '20px', marginBottom: '20px' }}>
          NFT was successfully fractionalized in transaction <Link to={{ pathname: `https://ropsten.etherscan.io/tx/${txHash}` }} target="_blank">{shortenAddress(txHash)}</Link>
          </Text>
        </>
      )}
      {status === ERROR && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '20px' }} color={colors.red}>
          {mmError || 'Error encountered!'}
          </Text>
        </>
      )}
      </Container>
  );
};

export default FractionalizeNft;
