import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { useFractionalizeNft } from '../../hooks/useFractionalizeNft';
import NotActive from '../../components/NotActive';
import Listings from '../../components/Listings';
import { FractFieldset, Legend } from '../../components/StyledHelpers';
import Text from '../../components/Text';

const Payout = () => {
  const { active } = useWeb3React();
  const { fractionalizeNftAddress } = useFractionalizeNft();

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {!active && <NotActive />}
      {active && (
        <FractFieldset>
          <Legend>
            Claim a Payout
          </Legend>
          <Text display="block">
            Following a buyout of a fractionalized NFT, an account that holds any of the corresponding ERC20 tokens can
            use this page to claim their payout from the sale proceedings.
          </Text>
          {fractionalizeNftAddress && <Listings fractionalizeNftAddress={fractionalizeNftAddress} fracNftState={2} action="payout" />}
        </FractFieldset>)}
    </Container>
  );
};

export default Payout;
