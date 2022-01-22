import { useAppContext } from '../AppContext';

const useAccountLastTxnHash = () => {
  const { setAccountLastTxnHash, accountLastTxnHash } = useAppContext();
  return { setAccountLastTxnHash, accountLastTxnHash };
};

export default useAccountLastTxnHash;
