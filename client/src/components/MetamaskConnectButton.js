import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import Text from './Text';
import { StyledHeaderBox } from './StyledHelpers';
import { injected } from '../connectors';
import { StyledAddress } from '../components/StyledAddress';
import { useAppContext } from '../AppContext';
import BalancesCard from './BalancesCard';
import MMLogo from '../static/metamask-logo.svg';
import { FaEthereum } from 'react-icons/fa';
import { colors } from '../theme';

const MetamaskLogo = styled.img.attrs({
  src: MMLogo,
})`
  height: 25px;
`;

const ConnectBtn = styled.button`
  border: 1px solid ${colors.blue};
  background: transparent;
  color: white;
  border-radius: 5px;
  margin-left: 10px;
`;

const pageState = {
  LOADING: 'LOADING',
  READY: 'READY',
};

const onLogOut = (deactivate, cb) => {
  deactivate();
  cb();
};

const MetamaskConnectButton = () => {
  const history = useHistory();
  const { setContentError } = useAppContext();
  const { activate, active, account, deactivate } = useWeb3React();
  const [status, setStatus] = useState(pageState.LOADING);

  useEffect(() => {
    const tryActivate = async () => {
      await activate(injected, () => {
        setStatus(pageState.READY);
      });
      setStatus(pageState.READY);
    };
    tryActivate();
  }, []);

  if (status === pageState.LOADING) {
    return <Text>Loading..</Text>;
  }

  if (status === pageState.READY && !active) {
    return (
      <ConnectBtn
        onClick={() => {
          if (!window.ethereum) {
            setContentError(["Failed to detect Metamask - please install it from ", <a href="https://metamask.io/download.html">https://metamask.io/download.html</a>]);
            return;
          }
          activate(injected, (e) => {
            if (e instanceof UnsupportedChainIdError) {
              setContentError('Only Ropsten supported - please change to the Ropsten Test Network in Metamask.');
            }
          });
        }}
      >
        Connect
      </ConnectBtn>
    );
  }

  // <MetamaskLogo />
  return (
    <StyledHeaderBox>
      <FaEthereum color={colors.blue}/>
      <Text
        style={{ margin: "8px", marginLeft: "12px", marginRight: "12px", fontFamily: "Source Code Pro" }}>
        <StyledAddress address={account} />  <BalancesCard />
      </Text>
      <ConnectBtn
        style={{ fontFamily: "Source Sans Pro" }}
        onClick={() => onLogOut(deactivate, () => history.push('/'))}>
        <span style={{ whiteSpace: "nowrap" }}>Log out</span>
      </ConnectBtn>
    </StyledHeaderBox>
  );
};

export default MetamaskConnectButton;
