import FaucetLinks from './FaucetLinks'
import Text from './Text';
import { colors } from '../theme';

const NotActive = () => {
  return (
    <>
      <Text display="block">
        Please connect an account to the Ropsten Test Network (<a style={{ color: colors.blue }} href="https://ropsten.etherscan.io/" target="blank">
          ropsten.etherscan.io</a>) to continue.
      </Text>
      <FaucetLinks />
    </>
  );
};

export default NotActive;
