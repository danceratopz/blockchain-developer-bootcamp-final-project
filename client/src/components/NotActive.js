import Text from './Text';
import { colors } from '../theme';

// TODO:
// Link to paradigm faucet (to get NFTs).

const NotActive = () => {
  return (
    <Text>
      Please connect or create a{' '}
      {
        <Text>
          <a style={{ color: colors.blue }} href="https://faucet.ropsten.be/" target="blank">
            Ropsten
          </a>
        </Text>
      }{' '}
      account to continue.
    </Text>
  );
};

export default NotActive;