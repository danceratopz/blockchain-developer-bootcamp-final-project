import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';

export function useFractionalizeNft() {
  const { chainId } = useWeb3React();
  const [fractionalizeNftAddress, setFractionalizeNftAddress] = useState(null);

  useEffect(() => {
    if (chainId === 1337) {
      // setFractionalizeNftAddress(fractionalizeNftContract.networks[chainId]?.address);
      // TODO: Contract address generation is deterministic; this is the address corresponding to the first deployment
      // of the contract. But can we automate it, as indicated above?
      setFractionalizeNftAddress("0x60942c0623CCdAd1441aCe477c21E5fFb93A4D38");
    } else if (chainId === 3) {
      setFractionalizeNftAddress("0xEBd4F1bB0C736f98FF6ED83007AF089f2f2b2517");
    }
  }, [chainId]);

  return {
    fractionalizeNftAddress,
  };
}
