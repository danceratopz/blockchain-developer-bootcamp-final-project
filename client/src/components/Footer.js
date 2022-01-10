import Text from './Text';
import { Link } from 'react-router-dom';
import { FaRegCopyright } from 'react-icons/fa';
import { colors } from '../theme';

const Footer = () => {
  return (
    <div style={{ position: "absolute", bottom: "0", right: "0", margin: "10px", marginTop: "20px" }}>
      <Text block center>
        <FaRegCopyright color={colors.blue} /> <Link style={{ fontFamily: "Source Code Pro", color: colors.blue }} to={{ pathname: `https://github.com/danceratopz/blockchain-developer-bootcamp-final-project` }} target="_blank">
          danceratopz
        </Link>
      </Text>
    </div>
  );
}

export default Footer;  