import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import Text from '../../components/Text';
import FractionalizeNft from '../../components/FractionalizeNft';
import { useFractionalizeNft } from '../../hooks/useFractionalizeNft';
import { colors } from '../../theme';

const Home = () => {
  const { active } = useWeb3React();
  const { fractionalizeNftAddress } = useFractionalizeNft();

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
      {!active && <NotActive />}
      {fractionalizeNftAddress && <FractionalizeNft fractionalizeNftAddress={fractionalizeNftAddress} />}
      <Text center t2>
        <a href="#buyout">Buyout</a> - <a href="#claim">Claim</a> - <a href="#redeem">Redeem</a>
      </Text>
    </Container>
  );
};

export default Home;
