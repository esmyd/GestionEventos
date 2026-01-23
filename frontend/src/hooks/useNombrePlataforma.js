import { useCallback, useEffect, useState } from 'react';
import { configuracionesService } from '../services/api';

const DEFAULT_NAME = 'Lirios Eventos';
const STORAGE_KEY = 'nombre_plataforma';

export const useNombrePlataforma = () => {
  const [nombrePlataforma, setNombrePlataformaState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_NAME
  );

  const setNombrePlataforma = useCallback((nuevoNombre) => {
    const valor = (nuevoNombre || '').trim() || DEFAULT_NAME;
    localStorage.setItem(STORAGE_KEY, valor);
    setNombrePlataformaState(valor);
    window.dispatchEvent(new Event('nombre-plataforma-updated'));
  }, []);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const data = await configuracionesService.getNombrePlataforma();
        const nombreApi = (data?.nombre_plataforma || '').trim() || DEFAULT_NAME;
        if (activo) {
          setNombrePlataformaState(nombreApi);
          localStorage.setItem(STORAGE_KEY, nombreApi);
        }
      } catch (_) {
        // Mantener valor actual si falla
      }
    };
    cargar();
    const sync = () => {
      const almacenado = localStorage.getItem(STORAGE_KEY) || DEFAULT_NAME;
      setNombrePlataformaState(almacenado);
    };
    window.addEventListener('nombre-plataforma-updated', sync);
    return () => {
      activo = false;
      window.removeEventListener('nombre-plataforma-updated', sync);
    };
  }, []);

  return { nombrePlataforma, setNombrePlataforma };
};
