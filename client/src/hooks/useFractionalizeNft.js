import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import fractionalizeNftContract from '../artifacts/contracts/FractionalizeNFT.json';

export function useFractionalizeNft() {
  const { chainId } = useWeb3React();
  const [fractionalizeNftAddress, setFractionalizeNftAddress] = useState(null);

  useEffect(() => {
    if (chainId) {
      //setFractionalizeNftAddress(fractionalizeNftContract.networks[chainId]?.address);
      // TODO!
      setFractionalizeNftAddress("0x60942c0623CCdAd1441aCe477c21E5fFb93A4D38");
    }
  }, [chainId]);

  return {
    fractionalizeNftAddress,
  };
}
