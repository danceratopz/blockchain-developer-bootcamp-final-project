import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Toggle from './Toggle';
import Menu from './Menu';
import { useAppContext } from '../AppContext';
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
  const [navToggled, setNavToggled] = useState(false);

  const handleNavToggle = () => {
    setNavToggled(!navToggled);
  }

  return (
    <>
      <GlobalError />
      <Navbar d-flex className="justify-content-between">
        <div>
          <Toggle handleNavToggle={handleNavToggle} />
          {navToggled ? <Menu handleNavToggle={handleNavToggle} /> : null}
        </div>
        <MetamaskConnectButton />
      </Navbar>
    </>
  );
};

export default Header;
