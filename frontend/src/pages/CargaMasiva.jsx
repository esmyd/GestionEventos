import React, { useState } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { cargaMasivaService } from '../services/api';

const tiposCarga = [
  {
    key: 'categorias',
    label: 'Categorías',
    descripcion: 'Carga masiva de categorías (crea o actualiza por ID o nombre).',
  },
  {
    key: 'productos',
    label: 'Productos',
    descripcion: 'Carga masiva de productos. Si no hay ID, se busca por nombre y categoría.',
  },
  {
    key: 'salones',
    label: 'Salones',
    descripcion: 'Carga masiva de salones (crea o actualiza por ID o nombre).',
  },
  {
    key: 'planes',
    label: 'Planes',
    descripcion: 'Carga masiva de planes (crea o actualiza por ID o nombre).',
  },
];

const CargaMasiva = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [archivos, setArchivos] = useState({});
  const [resultados, setResultados] = useState({});
  const [subiendo, setSubiendo] = useState({});

  const manejarArchivo = (tipo, archivo) => {
    setArchivos((prev) => ({ ...prev, [tipo]: archivo }));
  };

  const descargarTemplate = async (tipo) => {
    try {
      const blob = await cargaMasivaService.downloadTemplate(tipo);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plantilla_${tipo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo descargar la plantilla';
      showError(mensaje);
    }
  };

  const subirArchivo = async (tipo) => {
    const archivo = archivos[tipo];
    if (!archivo) {
      showError('Selecciona un archivo antes de subir.');
      return;
    }
    try {
      setSubiendo((prev) => ({ ...prev, [tipo]: true }));
      const data = await cargaMasivaService.upload(tipo, archivo);
      setResultados((prev) => ({ ...prev, [tipo]: data }));
      success(`Carga de ${tipo} completada.`);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo procesar el archivo';
      showError(mensaje);
    } finally {
      setSubiendo((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>Carga masiva</h1>
        <p style={{ color: '#6b7280' }}>
          Descarga la plantilla, llena los datos y sube el archivo para crear o actualizar registros existentes.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {tiposCarga.map((tipo) => {
          const resultado = resultados[tipo.key];
          return (
            <div
              key={tipo.key}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <FileText size={20} color="#6366f1" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{tipo.label}</h2>
              </div>
              <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>{tipo.descripcion}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => descargarTemplate(tipo.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  <Download size={16} />
                  Descargar plantilla
                </button>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(event) => manejarArchivo(tipo.key, event.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => subirArchivo(tipo.key)}
                  disabled={subiendo[tipo.key]}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: subiendo[tipo.key] ? '#9ca3af' : '#10b981',
                    color: 'white',
                    cursor: subiendo[tipo.key] ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  <Upload size={16} />
                  {subiendo[tipo.key] ? 'Cargando...' : 'Subir archivo'}
                </button>
              </div>

              {resultado && (
                <div style={{ marginTop: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{resultado.creados}</strong> creados
                    </div>
                    <div>
                      <strong>{resultado.actualizados}</strong> actualizados
                    </div>
                    <div>
                      <strong>{resultado.omitidos}</strong> omitidos
                    </div>
                    <div>
                      <strong>{(resultado.errores || []).length}</strong> con error
                    </div>
                  </div>
                  {(resultado.errores || []).length > 0 && (
                    <div style={{ marginTop: '0.75rem', color: '#b91c1c', fontSize: '0.85rem' }}>
                      {resultado.errores.slice(0, 5).map((err, index) => (
                        <div key={`${tipo.key}-${index}`}>
                          Fila {err.fila}: {err.error}
                        </div>
                      ))}
                      {resultado.errores.length > 5 && (
                        <div>Hay más errores, revisa el archivo para corregirlos.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CargaMasiva;
