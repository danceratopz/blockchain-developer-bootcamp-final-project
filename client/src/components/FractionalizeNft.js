import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Link, Redirect } from 'react-router-dom';
import { Contract } from '@ethersproject/contracts';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';
import { KnownNftContracts } from './KnownNftContracts';
import Text from './Text';
import { StyledTxn } from './StyledAddress';

import { TxnState } from '../utils/states';
import { processTxnError } from '../utils/processTxnError';
import { colors } from '../theme';
import { FractButton, FractFieldset, FractInput } from './StyledHelpers';
import { SkinnySpinner } from './ButtonHelpers';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';
import exampleErc721Contract from '../artifacts/contracts/TestNFT.json';

const CONFIRMATION_COUNT = 1;

function isPositiveFloat(str) {
  // see https://stackoverflow.com/a/10834843
  const n = Number(str);
  return n !== Infinity && String(n) === str && n >= 0;
}

function isPositiveInteger(str) {
  // see https://stackoverflow.com/a/10834843
  const n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

const FractionalizeNft = ({ fractionalizeNftAddress }) => {
  // Hold the state and hash of the ERC721 approve() transaction.
  const [approvalTxnStatus, setApprovalTxnStatus] = useState(TxnState.NOT_SUBMITTED);
  const [approvalTxnHash, setApprovalTxnHash] = useState(null);
  // Hold the state and hash of the fractionalizeNFT() transaction.
  const [actionTxnStatus, setActionTxnStatus] = useState(TxnState.NOT_SUBMITTED);
  const [actionTxnHash, setActionTxnHash] = useState(null);

  const [mmError, setMmError] = useState(null);

  const [nftContractAddress, setNftContractAddress] = useState('');
  const [nftTokenIndex, setNftTokenIndex] = useState('');
  const [erc20Name, setErc20Name] = useState('');
  const [erc20Symbol, setErc20Symbol] = useState('');
  const [erc20Supply, setErc20Supply] = useState('');
  const [buyoutPrice, setBuyoutPrice] = useState('');

  const { active, library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress;
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);

  const [windowDimension, setWindowDimension] = useState(null);

  useEffect(() => {
    setWindowDimension(window.innerWidth);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowDimension < 600;
  const addressInputWidth = isMobile ? '330px' : '460px';
  const tokenIdInputWidth = isMobile ? '120px' : '120px';
  const miscInputWidth = isMobile ? '290px' : '290px';

  const onApproveNftClick = async () => {
    try {
      setApprovalTxnStatus(TxnState.PENDING);
      const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
      const nftContract = new Contract(nftContractAddress, exampleErc721Contract.abi, signerOrProvider);
      const transaction = await nftContract.approve(fractionalizeNftContractAddress, nftTokenIndex, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setApprovalTxnStatus(TxnState.SUCCESS);
      setApprovalTxnHash(transaction.hash);
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setApprovalTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  const onFractionalizeNftClick = async () => {
    try {
      setActionTxnStatus(TxnState.PENDING);
      const transaction = await contract.fractionalizeNft(
        nftContractAddress,
        nftTokenIndex,
        erc20Name,
        erc20Symbol,
        ethers.utils.parseUnits(erc20Supply, 18), // The FractionalizeNFT ERC20Factory uses OpenZeppelin's default of 18 digits.
        ethers.utils.parseEther(buyoutPrice),
        { from: account },
      );
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setActionTxnStatus(TxnState.SUCCESS);
      setActionTxnHash(transaction.hash);
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setActionTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  if (!active) return <Redirect to="/" />;

  if (!active) return null;

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <FractFieldset>
        <legend style={{ float: 'left' }}>Fractionalize an NFT</legend>
        <Text style={{ display: 'inline-block' }}>
          Fractionalize an ERC721 NFT into an ERC20 token - the fractionalizing account receives the total supply.
        </Text>
        <FractFieldset>
          <legend style={{ float: 'left' }}>Approve</legend>
          <Text style={{ display: 'inline-block' }}>
            Approve the FractionalizeNFT contract to take ownership of the NFT.
          </Text>
          <br />
          <FractInput
            style={
              nftContractAddress.length !== 42
                ? { width: addressInputWidth, border: `1px solid ${colors.red}` }
                : { width: addressInputWidth }
            }
            name="nftContractAddress"
            placeholder="NFT contract address (string, 0x...)"
            type="text"
            list="knownNftContracts"
            value={nftContractAddress}
            onChange={(e) => setNftContractAddress(e.target.value)}
          />
          <KnownNftContracts />
          <FractInput
            style={
              !isPositiveInteger(nftTokenIndex)
                ? { width: tokenIdInputWidth, border: `1px solid ${colors.red}` }
                : { width: tokenIdInputWidth }
            }
            name="nftTokenIndex"
            placeholder="Token Index (int)"
            type="text"
            value={nftTokenIndex}
            onChange={(e) => setNftTokenIndex(e.target.value)}
          />
          {approvalTxnStatus === TxnState.NOT_SUBMITTED && (
            <FractButton
              style={
                !isPositiveInteger(nftTokenIndex) ? { border: '1px solid white', width: '200px' } : { width: '200px' }
              }
              disabled={!isPositiveInteger(nftTokenIndex)}
              onClick={onApproveNftClick}
              type="submit"
              name="approveNft"
            >
              Approve
            </FractButton>
          )}
          {(approvalTxnStatus === TxnState.FAIL || approvalTxnStatus === TxnState.ERROR) && (
            <>
              <FractButton
                style={
                  !isPositiveInteger(nftTokenIndex)
                    ? { border: '1px solid white', width: '200px' }
                    : { border: `1px solid ${colors.red}`, width: '200px' }
                }
                disabled={!isPositiveInteger(nftTokenIndex)}
                onClick={onApproveNftClick}
                type="submit"
                name="approveNft"
              >
                Approve
              </FractButton>
              <Text>(see error below)</Text>
            </>
          )}
          {approvalTxnStatus === TxnState.PENDING && (
            <FractButton style={{ width: '200px' }} disabled="1">
              <SkinnySpinner />
            </FractButton>
          )}
          {approvalTxnStatus === TxnState.SUCCESS && (
            <FractButton style={{ border: `1px solid ${colors.green}`, width: '200px' }} disabled="1">
              <StyledTxn hash={approvalTxnHash} />
            </FractButton>
          )}
        </FractFieldset>
        <FractFieldset>
          <legend style={{ float: 'left' }}>Fractionalize</legend>
          <Text style={{ display: 'inline-block' }}>
            Specify the parameters of the ERC20 token that will represent partial ownership of the NFT.
            <br />
            The buyout price specifies the price at which the NFT may be bought from the contract by a third party from
            the Market.
          </Text>
          <form>
            <div>
              <FractInput
                style={
                  erc20Name.length === 0
                    ? { width: miscInputWidth, border: `1px solid ${colors.red}` }
                    : { width: miscInputWidth }
                }
                name="erc20Name"
                placeholder="ERC Token Name (string)"
                type="text"
                value={erc20Name}
                onChange={(e) => setErc20Name(e.target.value)}
              />
              <FractInput
                style={
                  erc20Symbol.length === 0
                    ? { width: miscInputWidth, border: `1px solid ${colors.red}` }
                    : { width: miscInputWidth }
                }
                name="erc20Symbol"
                placeholder="ERC Token Symbol (string)"
                type="text"
                value={erc20Symbol}
                onChange={(e) => setErc20Symbol(e.target.value)}
              />
              <br />
              <FractInput
                style={
                  !isPositiveInteger(erc20Supply)
                    ? { width: miscInputWidth, border: `1px solid ${colors.red}` }
                    : { width: miscInputWidth }
                }
                name="erc20Supply"
                placeholder="ERC Token Supply (int)"
                type="text"
                value={erc20Supply}
                onChange={(e) => setErc20Supply(e.target.value)}
              />
              <FractInput
                style={
                  !isPositiveFloat(buyoutPrice)
                    ? { width: miscInputWidth, border: `1px solid ${colors.red}` }
                    : { width: miscInputWidth }
                }
                name="buyoutPrice"
                placeholder="Buyout Price (Ether)"
                type="text"
                value={buyoutPrice}
                onChange={(e) => setBuyoutPrice(e.target.value)}
              />
              {actionTxnStatus === TxnState.NOT_SUBMITTED && (
                <FractButton
                  style={
                    !isPositiveInteger(nftTokenIndex) ||
                    erc20Name.length === 0 ||
                    erc20Symbol.length === 0 ||
                    !isPositiveInteger(erc20Supply) ||
                    !isPositiveFloat(buyoutPrice)
                      ? { width: '200px', border: '1px solid white' }
                      : { width: '200px' }
                  }
                  disabled={
                    !isPositiveInteger(nftTokenIndex) ||
                    erc20Name.length === 0 ||
                    erc20Symbol.length === 0 ||
                    !isPositiveInteger(erc20Supply) ||
                    !isPositiveFloat(buyoutPrice)
                  }
                  onClick={onFractionalizeNftClick}
                  type="submit"
                  name="fractionalize"
                >
                  Fractionalize
                </FractButton>
              )}
              {(actionTxnStatus === TxnState.FAIL || actionTxnStatus === TxnState.ERROR) && (
                <>
                  <FractButton
                    style={
                      !isPositiveInteger(nftTokenIndex) ||
                      erc20Name.length === 0 ||
                      erc20Symbol.length === 0 ||
                      !isPositiveInteger(erc20Supply) ||
                      !isPositiveFloat(buyoutPrice)
                        ? { width: '200px', border: '1px solid white' }
                        : { width: '200px' }
                    }
                    disabled={
                      !isPositiveInteger(nftTokenIndex) ||
                      erc20Name.length === 0 ||
                      erc20Symbol.length === 0 ||
                      !isPositiveInteger(erc20Supply) ||
                      !isPositiveFloat(buyoutPrice)
                    }
                    onClick={onFractionalizeNftClick}
                    type="submit"
                    name="fractionalize"
                  >
                    Fractionalize
                  </FractButton>
                  <Text>(see error below)</Text>
                </>
              )}
              {actionTxnStatus === TxnState.SUCCESS && (
                <FractButton
                  style={{ border: `1px solid ${colors.green}`, width: '200px' }}
                  onClick={onFractionalizeNftClick}
                  disabled="1"
                  type="submit"
                  name="fractionalize"
                >
                  <StyledTxn hash={actionTxnHash} />
                </FractButton>
              )}
              {actionTxnStatus === TxnState.PENDING && (
                <FractButton style={{ width: '200px' }} disabled="1">
                  <SkinnySpinner />
                </FractButton>
              )}
            </div>
          </form>
        </FractFieldset>
      </FractFieldset>
      {approvalTxnStatus === TxnState.SUCCESS && (
        <>
          <Text style={{ marginTop: '20px', marginBottom: '10px' }}>
            NFT was successfully approved for transfer in transaction <StyledTxn hash={approvalTxnHash} />
          </Text>
        </>
      )}
      {actionTxnStatus === TxnState.SUCCESS && (
        <>
          <Text style={{ marginTop: '10px', marginBottom: '10px' }}>
            NFT was successfully fractionalized in transaction <StyledTxn hash={actionTxnHash} />
          </Text>
          <Text style={{ marginTop: '10px', marginBottom: '10px' }}>
            The fractionalized NFT (and its corresponding ERC20 address) can now be found on the{' '}
            <Link style={{ color: colors.blue }} to="/Market">
              Market
            </Link>{' '}
            and{' '}
            <Link style={{ color: colors.blue }} to="/Redeem">
              Redeem
            </Link>{' '}
            pages.
          </Text>
        </>
      )}
      {(approvalTxnStatus === TxnState.FAIL ||
        approvalTxnStatus === TxnState.ERROR ||
        actionTxnStatus === TxnState.FAIL ||
        actionTxnStatus === TxnState.ERROR) && (
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
