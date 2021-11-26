import FaucetLinks from './FaucetLinks'
import Text from './Text';
import { colors } from '../theme';

const NotActive = () => {
  return (
    <>
      <Text display="block">
      Please change to the "Ropsten Test Network" in Metamask to continue.
      </Text>
      <FaucetLinks />
    </>
  );
};

 // (<a style={{ color: colors.blue }} href="https://ropsten.etherscan.io/" target="blank"> ropsten.etherscan.io</a>)

export default NotActive;
