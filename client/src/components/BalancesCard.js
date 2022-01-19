import React, { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Text from './Text';
import useEth from '../hooks/useEth';
import useAccountLastTxnHash from '../hooks/useAccountLastTxnHash';

const BalanceCard = () => {
  const { active, account } = useWeb3React();
  const { fetchEthBalance, ethBalance } = useEth();
  const { accountLastTxnHash } = useAccountLastTxnHash();

  useEffect(() => {
    if (account) {
      fetchEthBalance();
    }
  }, [account, accountLastTxnHash]);

  if (!active) {
    return <Text>{''}</Text>;
  }

  return (
    <>
      <span style={{ whiteSpace: 'nowrap' }}>{ethBalance} ETH</span>
    </>
  );
};

export default BalanceCard;
