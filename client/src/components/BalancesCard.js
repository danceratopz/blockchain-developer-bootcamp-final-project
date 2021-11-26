import React, { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Text from './Text';
import { StyledHeaderBox } from './StyledHelpers';
import { colors } from '../theme';
import useEth from '../hooks/useEth';
import useTransaction from '../hooks/useTransaction';

const BalanceCard = () => {
  const { active, account } = useWeb3React();
  const { fetchEthBalance, ethBalance } = useEth();
  const { txnStatus, setTxnStatus } = useTransaction();

  useEffect(() => {
    if (account) {
      fetchEthBalance();
    }
  }, [account, txnStatus]);

  if (!active) {
    return <Text>{''}</Text>;
  }

  return (
    <StyledHeaderBox>
        Balance: {ethBalance} ETH
    </StyledHeaderBox>
  );
};

export default BalanceCard;
