import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { useFractionalizeNft } from '../../hooks/useFractionalizeNft';
import FractionalizeNft from '../../components/FractionalizeNft';
import NotActive from '../../components/NotActive';

const Home = () => {
  const { active } = useWeb3React();
  const { fractionalizeNftAddress } = useFractionalizeNft();

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      {!active && <NotActive />}
      {fractionalizeNftAddress && <FractionalizeNft fractionalizeNftAddress={fractionalizeNftAddress} />}
    </Container>
  );
};

export default Home;
