import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Container } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { useAppContext } from '../AppContext';
import BalancesCard from './BalancesCard';
import Navigation from './Navigation';
import MetamaskConnectButton from './MetamaskConnectButton';
import Text from './Text';

const StyledContainer = styled(Container)`
  background-color: tomato;
  text-align: center;
  justify-content: center;
`;

const GlobalError = () => {
  const { contentError, setContentError } = useAppContext();

  useEffect(() => {
    if (contentError) {
      setTimeout(() => {
        setContentError('');
      }, 5000);
    }
  }, [contentError]);

  if (!contentError) {
    return null;
  }
  return (
    <StyledContainer fluid>
      <Text>{contentError}</Text>
    </StyledContainer>
  );
};

const Header = () => {
  return (
    <>
      <GlobalError />
      <Navbar className="justify-content-between">
        <BalancesCard />
        <Navigation />
        <MetamaskConnectButton />
      </Navbar>
    </>
  );
};

export default Header;
