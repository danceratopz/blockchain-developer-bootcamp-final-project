import { useAppContext } from '../AppContext';

const useIsMobile = () => {
  const { setIsMobile, isMobile } = useAppContext();
  return { setIsMobile, isMobile };
};

export default useIsMobile;
