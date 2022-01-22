import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { useFractionalizeNft } from '../../hooks/useFractionalizeNft';
import AboutText from '../../components/AboutText';
import Listings from '../../components/Listings';
import { FractFieldset, Legend } from '../../components/StyledHelpers';
import Text from '../../components/Text';

const Buyout = () => {
  const { active } = useWeb3React();
  const { fractionalizeNftAddress } = useFractionalizeNft();

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {!active && <AboutText />}
      {active && (
        <FractFieldset>
          <Legend>Buy a Fractionalized NFT</Legend>
          <Text t4 block>
            Buy a fractionalized NFT from the contract and become its exclusive owner.
            <br />
            Sale proceedings are distributed proportionally to the holders of the ERC20 token.
          </Text>
          {fractionalizeNftAddress && <Listings fractionalizeNftAddress={fractionalizeNftAddress} action="buyout" />}
        </FractFieldset>
      )}
    </Container>
  );
};

export default Buyout;
