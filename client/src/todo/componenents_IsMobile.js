import { useEffect, useState } from 'react';
import useIsMobile from './hooks_IsMobile';

export const IsMobile = () => {
  const [windowDimension, setWindowDimension] = useState(null);
  const { setIsMobile } = useIsMobile();

  useEffect(() => {
    setWindowDimension(window.innerWidth);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  setIsMobile(windowDimension < 640);

  return null;
};
