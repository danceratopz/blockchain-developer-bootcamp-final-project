import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract, utils } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { useContract } from '../hooks/useContract';
import useAccountLastTxnHash from '../hooks/useAccountLastTxnHash';
import { processTxnError } from '../utils/processTxnError';
import { TxnState } from '../utils/states';
import Text from './Text';
import { StyledAddress, StyledTxn } from './StyledAddress';
import {
  FractFieldset,
  InfoFieldset,
  FractButton,
  StyledDiv,
  StyledItem,
  StyledItemTextContainer,
} from './StyledHelpers';
import { CopyButton, PendingButton, DisabledButton, SuccessButton } from './ButtonHelpers';
import { colors } from '../theme';

import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';

const CONFIRMATION_COUNT = 1;

const listingState = {
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

function getJSON(url, callback) {
  // https://stackoverflow.com/a/35970894
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function onload() {
    const { status } = xhr;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

const LinkedNftTokenId = ({ contractAddress, tokenId }) => (
  <Link
    style={{ color: colors.blue }}
    to={{ pathname: `https://ropsten.etherscan.io/token/${contractAddress}?a=${tokenId}#inventory` }}
    target="_blank"
  >
    Id {BigNumber.from(tokenId).toNumber()}
  </Link>
);

const NoListings = ({ message }) => (
  <StyledDiv>
    <InfoFieldset>
      <Text color={colors.secondary} style={{ display: 'inline-block' }} text-align="center">
        {message}
      </Text>
    </InfoFieldset>
  </StyledDiv>
);

const FilteredListing = ({ fractionalizeNftAddress, listings, action }) => {
  const [status, setStatus] = useState(listingState.LOADING);
  const { active, account, library } = useWeb3React();
  const [filteredByHolder, setFilteredByHolder] = useState([]);

  const holdsEnoughErc20TokensForAction = useCallback(async (account, action, library, erc20Address) => {
    const abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function totalSupply() view returns (uint256)',
    ];
    const signerOrProvider = library;
    const erc20 = new Contract(erc20Address, abi, signerOrProvider);
    const balance = await erc20.balanceOf(account);

    if (action === 'redeem') {
      // TODO: This could be sped-up in the case of originalOwner redemptions (by checking if account is originalOwner
      // and state is Fractionalized). The contract could even maintain a list. This does not cover all cases though.
      const totalSupply = await erc20.totalSupply();
      // console.log("totalSupply ", utils.formatUnits(totalSupply), "balance ", utils.formatUnits(balance));
      return utils.formatUnits(balance) === utils.formatUnits(totalSupply);
    }
    if (action === 'payout') {
      return utils.formatUnits(balance) > 0;
    }
    // eslint-disable-next-line no-console
    console.log("Error: unexpected action: '", action, "'");
    return `error in holdsEnoughErc20TokensForAction(): recieved unexpected action ${action}`;
  }, []);

  const filterListings = useCallback(async (action, listings) => {
    let requiredState;
    if (action === 'buyout' || action === 'redeem') {
      requiredState = 0; // fractionalized
    } else if (action === 'payout') {
      requiredState = 2; // boughtout
    } else {
      // eslint-disable-next-line no-console
      console.log("Error: unexpected action: '", action, "'");
    }
    let filtered = listings.filter((l) => l.state === requiredState);
    // Anyone can buyout an NFT, but only holders of the fractionalized NFT's ERC20 can either redeem (account holds
    // total supply) or claim (account's balance > 0). So here we additionally filter the listings using the account's
    // corresponding ERC20 balances.
    // if (action === "buyout") {
    //  filtered = listings.filter((l) => l.originalOwner != account);
    if (action === 'redeem' || action === 'payout') {
      const accountHoldsEnoughErc20TokensForAction = new Array(listings.length);
      for (let i = 0; i < listings.length; i += 1) {
        // TODO: make async - but check getFracNfts() in Listings :)
        // eslint-disable-next-line no-await-in-loop
        accountHoldsEnoughErc20TokensForAction[i] = await holdsEnoughErc20TokensForAction(
          account,
          action,
          library,
          listings[i].erc20Address,
        );
      }
      filtered = filtered.filter((l) => accountHoldsEnoughErc20TokensForAction[l.fracNFTId]);
      setFilteredByHolder(filtered);
    } else if (action === 'buyout') {
      setFilteredByHolder(filtered);
    } else {
      // eslint-disable-next-line no-console
      console.log("Error: unexpected action: '", action, "'");
    }
    setStatus(listingState.READY);
  }, []);

  useEffect(() => {
    if (active) {
      filterListings(action, listings);
    }
  }, [active]);

  if (status === listingState.LOADING) {
    return (
      <StyledDiv>
        <Spinner animation="border" size="sm" style={{ color: colors.red, marginTop: '20px' }} />
      </StyledDiv>
    );
  }

  if (status === listingState.READY) {
    if (filteredByHolder.length === 0) {
      if (action === 'buyout') {
        return <NoListings message={'There are currently no fractionalized NFTs in the contract to buy.'} />;
      }
      if (action === 'redeem') {
        return (
          <NoListings
            message={[
              'No redemptions are available for the account ',
              <StyledAddress key="redeem" address={account} />,
            ]}
          />
        );
      }
      if (action === 'payout') {
        return (
          <NoListings
            message={['No payouts are available for the account ', <StyledAddress key="payout" address={account} />]}
          />
        );
      }
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
  const { nftTokenId, erc721Address, erc20Address, erc20Name, buyoutPrice } = item;

  const [mmError, setMmError] = useState(null);
  // Hold the state and hash of the ERC20 approve() transaction.
  const [approvalTxnStatus, setApprovalTxnStatus] = useState(TxnState.NOT_SUBMITTED);
  const [approvalTxnHash, setApprovalTxnHash] = useState(null);
  // Hold the state and hash of the fractionalizeNFT() transaction.

  const [actionTxnStatus, setActionTxnStatus] = useState(TxnState.NOT_SUBMITTED);
  const [actionTxnHash, setActionTxnHash] = useState(null);
  const { setAccountLastTxnHash } = useAccountLastTxnHash(); // This is used by the global AppContext to update the account balance.

  const { library, account, chainId } = useWeb3React();
  const fractionalizeNftContractAddress = fractionalizeNftAddress;
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageAltText, setImageAltText] = useState('');

  const onBuyNftClick = async (fracNFTId, buyoutPrice) => {
    try {
      setActionTxnStatus(TxnState.PENDING);
      const transaction = await contract.buyout(fracNFTId, { from: account, value: buyoutPrice });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setActionTxnHash(transaction.hash); // local state
      setAccountLastTxnHash(transaction.hash); // global state
      setActionTxnStatus(TxnState.SUCCESS);
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setActionTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  const onApproveErc20Click = async () => {
    try {
      setApprovalTxnStatus(TxnState.PENDING);
      const abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function approve(address owner, uint256 amount) returns (bool)',
      ];
      const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
      const erc20 = new Contract(erc20Address, abi, signerOrProvider);
      const balance = await erc20.balanceOf(account);
      const transaction = await erc20.approve(fractionalizeNftContractAddress, balance, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setApprovalTxnHash(transaction.hash);
      setApprovalTxnStatus(TxnState.SUCCESS);
      setAccountLastTxnHash(transaction.hash); // global state
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setApprovalTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  const onRedeemNftClick = async (fracNFTId) => {
    try {
      setActionTxnStatus(TxnState.PENDING);
      const transaction = await contract.redeem(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setActionTxnHash(transaction.hash);
      setActionTxnStatus(TxnState.SUCCESS);
      setAccountLastTxnHash(transaction.hash); // global state
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setActionTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  const onPayoutClick = async (fracNFTId) => {
    setActionTxnHash('waitingpayout');
    try {
      setActionTxnStatus(TxnState.PENDING);
      const transaction = await contract.claim(fracNFTId, { from: account });
      const confirmations = chainId === 1337 ? 1 : CONFIRMATION_COUNT;
      await transaction.wait(confirmations);
      setActionTxnHash(transaction.hash);
      setActionTxnStatus(TxnState.SUCCESS);
      setAccountLastTxnHash(transaction.hash); // global state
    } catch (e) {
      const [txnStatus, message] = await processTxnError(e);
      setActionTxnStatus(txnStatus);
      setMmError(message);
    }
  };

  const getNftImage = useCallback(async () => {
    // TODO: This still requires quite some optimisation
    const abi = ['function tokenURI(uint256 id) view returns (string)'];
    const signerOrProvider = library;
    const erc721Contract = new Contract(erc721Address, abi, signerOrProvider);
    const jsonUri = await erc721Contract.tokenURI(BigNumber.from(nftTokenId).toNumber());

    if (erc721Address === '0x4C153BFaD26628BdbaFECBCD160A0790b1b8F212') {
      // Paradigm's original multifaucet deployment set the tokenURI to the image. Only in the subsequent deployment to
      // 0xf5d..e3a2b the tokenURI was set that to the JSON metadata file (as expected by convention).
      setImageUrl(jsonUri);
      return;
    }

    // TODO: Hack. Don't use pinata's public IPFS gateway to retrieve the NFTs JSON:
    // https://gateway.pinata.cloud/ipfs -> https://gateway.ipfs.io/ipfs/
    // The tokenURIs from the NFTs minted in the test contract point to https://gateway.pinata.cloud/ipfs but Pinata
    // appears to (sometimes) throttle even small amounts of requests made within a small time window on their public
    // gateway. This would be better solved by asynchronously loading the listing items and adding a retry mechanism
    // for the json/images with exponential backoff.
    const jsonUriHotfix = jsonUri.replace('pinata.cloud', 'ipfs.io');

    getJSON(jsonUriHotfix, (err, data) => {
      if (err !== null) {
        setImageUrl(null);
        setImageAltText('Error retrieving image');
      } else if (data !== null) {
        // TODO: Hack. Don't use pinata's IPFS gateway for the NFT images (as above for JSON)
        const imageUrl = data.image.replace('pinata.cloud', 'ipfs.io');
        setImageUrl(imageUrl);
        if (Object.prototype.hasOwnProperty.call(data, 'description')) {
          setImageAltText(data.description);
        } else {
          setImageAltText('NFT Image');
        }
      } else {
        setImageUrl(null);
        setImageAltText('Unable to retrieve image');
      }
    });
  }, []);

  getNftImage();

  const NftImage = () => (
    <img
      src={imageUrl}
      style={{
        height: '150px',
        objectFit: 'contain',
        borderRadius: '5px',
        border: `1px solid ${colors.blue}`,
        fontFamily: 'Source Sans Pro',
        textAlign: 'center',
      }}
      alt={imageAltText}
    />
  );

  return (
    <>
      <FractFieldset>
        <div>
          <StyledItem>
            <StyledItemTextContainer>
              <Text
                center
                display="block"
                line-height="50px"
                text-overflow="ellipsis "
                overflow="hidden"
                style={{ fontFamily: 'Source Code Pro' }}
              >
                {erc20Name}
              </Text>
              <NftImage fracNftId={item.fracNftId} />
              <Text style={{ fontFamily: 'Source Code Pro' }}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  ERC721: <StyledAddress address={erc721Address} />
                  <CopyButton text={erc721Address} />
                </span>
                <br />
                ERC721 Token: <LinkedNftTokenId contractAddress={erc721Address} tokenId={nftTokenId} />
                <br />
                ERC20: <StyledAddress address={erc20Address} />
                <CopyButton text={erc20Address} />
              </Text>

              {action === 'buyout' &&
                (actionTxnStatus === TxnState.NOT_SUBMITTED ||
                  actionTxnStatus === TxnState.ERROR ||
                  actionTxnStatus === TxnState.FAIL) && (
                  <StyledItem>
                    <FractButton
                      style={{ width: '150px' }}
                      onClick={() => onBuyNftClick(item.fracNFTId, item.buyoutPrice)}
                      type="submit"
                      name="buyNft"
                    >
                      Buy for
                      <br />
                      {parseFloat(formatEther(buyoutPrice)).toPrecision(3)} ETH
                    </FractButton>
                  </StyledItem>
                )}
              {action === 'buyout' && actionTxnStatus === TxnState.PENDING && <PendingButton />}
              {action === 'buyout' && actionTxnStatus === TxnState.SUCCESS && (
                <StyledItem>
                  <FractButton
                    style={{ width: '150px', border: `1px solid ${colors.green}` }}
                    disabled="1"
                    type="submit"
                    name="buyNft"
                  >
                    <span style={{ color: colors.green, whiteSpace: 'nowrap' }}>Bought in</span>
                    <br />
                    <StyledTxn hash={actionTxnHash} />
                  </FractButton>
                </StyledItem>
              )}

              {(action === 'redeem' || action === 'payout') &&
                (approvalTxnStatus === TxnState.NOT_SUBMITTED ||
                  approvalTxnStatus === TxnState.FAIL ||
                  approvalTxnStatus === TxnState.ERROR) && (
                  <StyledItem>
                    <FractButton
                      style={{ width: '150px' }}
                      onClick={() => onApproveErc20Click(item.fracNFTId)}
                      type="submit"
                      name="onApproveErc20Click"
                    >
                      Approve
                    </FractButton>
                  </StyledItem>
                )}
              {(action === 'redeem' || action === 'payout') && approvalTxnStatus === TxnState.PENDING && (
                <PendingButton />
              )}
              {(action === 'redeem' || action === 'payout') && approvalTxnStatus === TxnState.SUCCESS && (
                <SuccessButton txnHash={approvalTxnHash} />
              )}

              {action === 'redeem' &&
                approvalTxnStatus !== TxnState.SUCCESS &&
                (actionTxnStatus === TxnState.NOT_SUBMITTED ||
                  actionTxnStatus === TxnState.ERROR ||
                  actionTxnStatus === TxnState.FAIL) && <DisabledButton text="Redeem" />}
              {action === 'redeem' &&
                approvalTxnStatus === TxnState.SUCCESS &&
                (actionTxnStatus === TxnState.NOT_SUBMITTED ||
                  actionTxnStatus === TxnState.ERROR ||
                  actionTxnStatus === TxnState.FAIL) && (
                  <StyledItem>
                    <FractButton
                      style={{ width: '150px' }}
                      onClick={() => onRedeemNftClick(item.fracNFTId)}
                      type="submit"
                      name="redeemNft"
                    >
                      Redeem
                    </FractButton>
                  </StyledItem>
                )}
              {action === 'redeem' && actionTxnStatus === TxnState.PENDING && <PendingButton />}
              {action === 'redeem' && actionTxnStatus === TxnState.SUCCESS && <SuccessButton txnHash={actionTxnHash} />}

              {action === 'payout' &&
                approvalTxnStatus !== TxnState.SUCCESS &&
                (actionTxnStatus === TxnState.NOT_SUBMITTED ||
                  actionTxnStatus === TxnState.ERROR ||
                  actionTxnStatus === TxnState.FAIL) && <DisabledButton text="Claim" />}
              {action === 'payout' &&
                approvalTxnStatus === TxnState.SUCCESS &&
                (actionTxnStatus === TxnState.NOT_SUBMITTED ||
                  actionTxnStatus === TxnState.ERROR ||
                  actionTxnStatus === TxnState.FAIL) && (
                  <StyledItem>
                    <FractButton
                      style={{ width: '150px' }}
                      onClick={() => onPayoutClick(item.fracNFTId)}
                      type="submit"
                      name="payout"
                    >
                      Claim
                    </FractButton>
                  </StyledItem>
                )}
              {action === 'payout' && actionTxnStatus === TxnState.PENDING && <PendingButton />}
              {action === 'payout' && actionTxnStatus === TxnState.SUCCESS && <SuccessButton txnHash={actionTxnHash} />}
            </StyledItemTextContainer>

            {(actionTxnStatus === TxnState.ERROR ||
              actionTxnStatus === TxnState.FAIL ||
              approvalTxnStatus === TxnState.ERROR ||
              approvalTxnStatus === TxnState.FAIL) && (
              <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
                <Text style={{ marginBottom: '20px' }} color={colors.red}>
                  {mmError || 'Unknown error encountered! Please reload.'}
                </Text>
              </Container>
            )}
          </StyledItem>
        </div>
      </FractFieldset>
    </>
  );
};

const Listings = ({ fractionalizeNftAddress, action }) => {
  const [status, setStatus] = useState(listingState.LOADING);
  const [listings, setListings] = useState([]);
  const { active } = useWeb3React();
  const contract = useContract(fractionalizeNftAddress, fractionalizeNftContract.abi);

  const getFracNfts = async (contract) => {
    try {
      // TODO: Make asynchronous.
      const fracNftCount = (await contract.getFracNftCount()).toNumber();
      const fracNftIds = Array.from(Array(fracNftCount).keys()); // create an array [0, 1, 2, ..., N]
      const fracNfts = await Promise.all(fracNftIds.map((id) => contract.fracNFTs(id)));
      setListings(fracNfts);
      setStatus(listingState.READY);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error:', e);
      setStatus(listingState.ERROR);
    }
  };

  useEffect(() => {
    if (active) {
      getFracNfts(contract);
    }
  }, [active]);

  if (!active) {
    return null;
  }

  if (status === listingState.LOADING) {
    return (
      <StyledDiv>
        <Spinner animation="border" size="sm" style={{ color: colors.green, marginTop: '20px' }} />
      </StyledDiv>
    );
  }

  return <FilteredListing fractionalizeNftAddress={fractionalizeNftAddress} listings={listings} action={action} />;
};

export default Listings;
