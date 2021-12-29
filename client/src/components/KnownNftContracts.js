import { useWeb3React } from '@web3-react/core';

export const KnownNftContracts = () => {
  const { chainId } = useWeb3React();

  if (chainId === 1337) {
    return (
        <datalist id="knownNftContracts">
        <option value="0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b">Paradigm Faucet (>2021-11-18)- 0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b</option>
        <option value="0x4c153bfad26628bdbafecbcd160a0790b1b8f212">Paradigm Faucet (>2021-11-08)- 0x4c153bfad26628bdbafecbcd160a0790b1b8f212</option>
        <option value="0x3f4d004805BcfB46b225b37f5900F1291b227716">TestNFT - 0x3f4d004805BcfB46b225b37f5900F1291b227716</option>
        </datalist>
    )
  } else {
    return (
        <datalist id="knownNftContracts">
        <option value="0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b">Paradigm Faucet (>2021-11-18)- 0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b</option>
        <option value="0x4c153bfad26628bdbafecbcd160a0790b1b8f212">Paradigm Faucet (>2021-11-08)- 0x4c153bfad26628bdbafecbcd160a0790b1b8f212</option>
        <option value="0x7Ee4B89669fA602d059C9A9B1bED45bEf94acf75">WannabeNFT - 0x7Ee4B89669fA602d059C9A9B1bED45bEf94acf75</option>
        </datalist>
    )
  }
};
