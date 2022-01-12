import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Navigation from './Navigation';
import Toggle from './Toggle';
import Menu from './Menu';
import { useAppContext } from '../AppContext';
import MetamaskConnectButton from './MetamaskConnectButton';
import Text from './Text';
import { colors } from '../theme';

const StyledContainer = styled(Container)`
  background-color: #1f1f1f;
  text-align: center;
  justify-content: center;
  position: absolute;
  z-index: 1;
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
      <Text t4>{contentError}</Text>
    </StyledContainer>
  );
};

const Header = () => {
  const [navToggled, setNavToggled] = useState(false);
  const [windowDimension, setWindowDimension] = useState(null);

  useEffect(() => {
    setWindowDimension(window.innerWidth);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  const isMobile = windowDimension < 720;

  const handleNavToggle = () => {
    setNavToggled(!navToggled);
  }

  return (
    <>
      <GlobalError />
      <Navbar className="d-flex justify-content-between">
        <div>
          {isMobile ?
            <>
              <Toggle handleNavToggle={handleNavToggle} />
              {navToggled ? <Menu handleNavToggle={handleNavToggle} /> : null}
            </>
            : <Navigation />}
        </div>
        <MetamaskConnectButton />
      </Navbar>
    </>
  );
};

export default Header;
