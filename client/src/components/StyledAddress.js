import { shortenAddress } from '../utils/shortenAddress';
import { Link } from 'react-router-dom';
import { colors } from '../theme';

const StyledAddress = ({ address }) => {
  return (
      <Link style={{ fontFamily: "Source Code Pro", color: colors.blue }} to={{ pathname: `https://ropsten.etherscan.io/tx/${address}` }} target="_blank">
        {shortenAddress(address)}
      </Link>
  )
};

export default StyledAddress;
