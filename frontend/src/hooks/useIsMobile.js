import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 768;

const useIsMobile = (breakpoint = DEFAULT_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const actualizarVista = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    actualizarVista();
    window.addEventListener('resize', actualizarVista);
    return () => window.removeEventListener('resize', actualizarVista);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
