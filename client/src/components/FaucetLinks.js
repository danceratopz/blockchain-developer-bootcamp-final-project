import Text from './Text';
import { colors } from '../theme';

const FaucetLinks = () => {
  return (
    <Text display="block">
      Ropsten Test Ether can be obtained from the following Faucets:
      <ul>
        <li>
          <a style={{ color: colors.blue }} href="https://faucet.paradigm.xyz/" target="blank">faucet.paradigm.xyz</a> (also drips test NFTs).
        </li>
        <li>
          <a style={{ color: colors.blue }} href="https://faucet.ropsten.be/" target="blank">faucet.ropsten.be</a>.
        </li>
      </ul>
    </Text>
  );
};

export default FaucetLinks;
