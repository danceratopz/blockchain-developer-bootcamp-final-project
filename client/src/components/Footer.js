import { FaRegCopyright } from 'react-icons/fa';
import { colors } from '../theme';
import { StyledAddress } from './StyledAddress';
import { StyledAnchor } from './StyledHelpers';
import Text from './Text';

const Footer = () => {
  const ropstenAddress = '0xEBd4F1bB0C736f98FF6ED83007AF089f2f2b2517';

  return (
    <div style={{ position: 'absolute', bottom: '0', right: '0', margin: '10px', marginTop: '20px' }}>
      <Text block center>
        <FaRegCopyright color={colors.blue} />
        <StyledAnchor href="https://github.com/danceratopz/blockchain-developer-bootcamp-final-project">
          danceratopz
        </StyledAnchor>
        {' - '}
        <StyledAddress address={ropstenAddress} />
      </Text>
    </div>
  );
};

export default Footer;
