import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { FaEthereum } from 'react-icons/fa';
import Text from './Text';
import { StyledHeaderBox, StyledAnchor } from './StyledHelpers';
import { injected } from '../connectors';
import { StyledAddress } from './StyledAddress';
import { useAppContext } from '../AppContext';
import BalancesCard from './BalancesCard';
import { colors } from '../theme';

const FractButton = styled.button`
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
      <StyledHeaderBox>
        <Text>
          <FaEthereum color={colors.blue} size="22" />{' '}
        </Text>
        <FractButton
          style={{ background: colors.componentBackground }}
          onClick={() => {
            if (!window.ethereum) {
              setContentError([
                'Failed to detect Metamask - please install it from ',
                <StyledAnchor key="mm" href="https://metamask.io/download.html">
                  https://metamask.io/download.html
                </StyledAnchor>,
              ]);
              return;
            }
            activate(injected, (e) => {
              if (e instanceof UnsupportedChainIdError) {
                setContentError('Only Ropsten is supported - please change to the Ropsten Test Network in Metamask.');
              }
            });
          }}
        >
          Connect
        </FractButton>
      </StyledHeaderBox>
    );
  }

  function noop() {}

  // <MetamaskLogo />
  return (
    <StyledHeaderBox>
      <FaEthereum color={colors.blue} size="22" />
      <Text style={{ margin: '8px', marginLeft: '12px', marginRight: '12px', fontFamily: 'Source Code Pro' }}>
        <StyledAddress address={account} /> <BalancesCard />
      </Text>
      <FractButton style={{ fontFamily: 'Source Sans Pro' }} onClick={() => onLogOut(deactivate, () => noop())}>
        <span style={{ whiteSpace: 'nowrap' }}>Log out</span>
      </FractButton>
    </StyledHeaderBox>
  );
};

export default MetamaskConnectButton;
