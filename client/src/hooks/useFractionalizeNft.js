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
      setFractionalizeNftAddress("0xf976B3EADa13DcE4a20a37bd2A7427A9ba38EEc2");
    }
  }, [chainId]);

  return {
    fractionalizeNftAddress,
  };
}
