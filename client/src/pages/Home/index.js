import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import Text from '../../components/Text';
// import Listings from '../../components/Listings';
// import { useRentals } from '../../hooks/useRentals';
import { colors } from '../../theme';

const Home = () => {
  const { active } = useWeb3React();
  // const { rentalsAddress } = useRentals();

  const NotActive = () => {
    return (
      <Text>
        Please connect or create a{' '}
        {
          <Text>
            <a style={{ color: colors.blue }} href="https://faucet.ropsten.be/" target="blank">
              Ropsten
            </a>
          </Text>
        }{' '}
        account to continue.
      </Text>
    );
  };

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <Text center t1 style={{ marginBottom: '20px' }}>
        Fractionalize an NFT
      </Text>
      <br/>
      {!active && <NotActive />}
    </Container>
  );
};

export default Home;
