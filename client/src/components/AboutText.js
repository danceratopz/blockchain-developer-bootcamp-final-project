import { useWeb3React } from '@web3-react/core';
import Text from './Text';
import { FractFieldset, NoFractFieldset, StyledDiv, StyledAnchor } from './StyledHelpers';
import { StyledAddress } from './StyledAddress';

const AboutText = () => {
  const { active } = useWeb3React();

  const ropstenAddress = '0xEBd4F1bB0C736f98FF6ED83007AF089f2f2b2517';
  const contractLink = `https://ropsten.etherscan.io/address/${ropstenAddress}`;

  return (
    <FractFieldset>
      <legend style={{ float: 'left' }}>About - NFT Fractionalizer and Market</legend>

      {!active && (
        <NoFractFieldset>
          {!window.ethereum && (
            <StyledDiv>
              <Text t4 center>
                Failed to detect Metamask. To explore the UI and interact with the contract please install{' '}
                <StyledAnchor href="https://metamask.io/download.html">Metamask</StyledAnchor> and change to{' '}
                <span style={{ whiteSpace: 'nowrap' }}>
                  the <b>Ropsten Test Network</b>
                </span>
                .
              </Text>
            </StyledDiv>
          )}
          {window.ethereum && (
            <StyledDiv>
              <Text t4 center>
                To explore the UI and interact with the contract please change to the <b>Ropsten Test Network</b> in
                Metamask and hit <b>Connect</b>.
              </Text>
            </StyledDiv>
          )}
        </NoFractFieldset>
      )}
      <p>
        This is a frontend to an NFT fractionalizer running on the Ethereum Ropsten Testnet. Upon fractionalization a
        user sends an NFT to the contract and in return receives newly created ERC20 tokens. The ERC20 tokens may be
        distributed among multiple accounts to represent shared ownership of the NFT. If the NFT gets bought from the
        contract, holders of the corresponding ERC20 token may claim their share of the sales proceedings.
      </p>
      <p>
        In order to interact with the contract you'll need some Ropsten Test Ether (to buy an NFT) or a Ropsten NFT (to
        fractionalize):
      </p>
      <ul>
        <li key="paradigm">
          <StyledAnchor href="https://faucet.paradigm.xyz/" target="blank">
            faucet.paradigm.xyz
          </StyledAnchor>{' '}
          drips both test Ether and NFTs (requires Twitter sign-in).
        </li>
        <li key="faucetbe">
          <StyledAnchor href="https://faucet.ropsten.be/" target="blank">
            faucet.ropsten.be
          </StyledAnchor>{' '}
          drips test Ether.
        </li>
      </ul>
      <p>
        Otherwise, feel free to contact me{' '}
        <StyledAnchor href="https://github.com/danceratopz">(Github profile)</StyledAnchor> with your Ropsten address
        and I'll send you some test Ether or NFTs.
      </p>
      <p>
        This dapp was created as the Final Project for the{' '}
        <StyledAnchor href="https://consensys.net/bootcamp">ConSensys Blockchain Bootcamp 2021</StyledAnchor>: the
        contract and frontend source are available on{' '}
        <StyledAnchor href="https://github.com/danceratopz/blockchain-developer-bootcamp-final-project">
          Github
        </StyledAnchor>
        : the contract is deployed at <StyledAddress address={ropstenAddress} />.
      </p>
    </FractFieldset>
  );
};

export default AboutText;
