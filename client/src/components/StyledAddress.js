import { Link } from 'react-router-dom';
import { shortenAddress } from '../utils/shortenAddress';
import { colors } from '../theme';

export const StyledAddress = ({ address }) => (
  <Link
    style={{ fontFamily: 'Source Code Pro', color: colors.blue }}
    to={{ pathname: `https://ropsten.etherscan.io/address/${address}` }}
    target="_blank"
  >
    {shortenAddress(address)}
  </Link>
);

export const StyledTxn = ({ hash }) => (
  <Link
    style={{ fontFamily: 'Source Code Pro', color: colors.green }}
    to={{ pathname: `https://ropsten.etherscan.io/tx/${hash}` }}
    target="_blank"
  >
    {shortenAddress(hash)}
  </Link>
);
