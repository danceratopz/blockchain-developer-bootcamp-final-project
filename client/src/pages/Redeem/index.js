import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { useFractionalizeNft } from '../../hooks/useFractionalizeNft';
import AboutText from '../../components/AboutText';
import Listings from '../../components/Listings';
import { FractFieldset, Legend } from '../../components/StyledHelpers';
import Text from '../../components/Text';

const Redeem = () => {
  const { active } = useWeb3React();
  const { fractionalizeNftAddress } = useFractionalizeNft();

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {!active && <AboutText />}
      {active && (
        <FractFieldset>
          <Legend>Redeem a Fractionalized NFT</Legend>
          <Text t4 block>
            An address that holds the entire supply of a fractionalized NFTs ERC20 Token can redeem the NFT in exchange
            for the tokens in order to (re-)gain ownership of the NFT.
          </Text>
          {fractionalizeNftAddress && <Listings fractionalizeNftAddress={fractionalizeNftAddress} action="redeem" />}
        </FractFieldset>
      )}
    </Container>
  );
};

export default Redeem;
