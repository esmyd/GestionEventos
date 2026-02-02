import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction, Sparkles } from 'lucide-react';

const TITULOS_POR_RUTA = {
  'envio-sugerencia': 'Envío de Sugerencia',
  proveedores: 'Proveedores',
  'facturacion-electronica': 'Facturación Electrónica',
  contratos: 'Contratos Digitales',
  'reservas-online': 'Reservas Online',
  'crm-avanzado': 'CRM Avanzado',
  'integracion-contabilidad': 'Integración Contable',
  'sitio-web-eventos': 'Sitio Web de Eventos',
  instagram: 'Instagram',
};

const ALCANCE_POR_RUTA = {
  'envio-sugerencia': [
    'Formulario para que clientes envíen sugerencias y feedback',
    'Registro y seguimiento de sugerencias recibidas',
    'Notificaciones al equipo cuando llegue una nueva sugerencia',
  ],
  proveedores: [
    'Catálogo de proveedores (floristerías, catering, DJ, etc.)',
    'Contactos, precios de referencia y disponibilidad',
    'Asignación de proveedores a eventos',
  ],
  'facturacion-electronica': [
    'Generación de facturas electrónicas desde los eventos y pagos',
    'Integración con SRI (Ecuador) o autoridad tributaria',
    'Comprobantes en PDF con firma electrónica',
  ],
  contratos: [
    'Plantillas de contratos digitales',
    'Firma electrónica para clientes',
    'Historial y respaldo de contratos firmados',
  ],
  'reservas-online': [
    'Página pública para que clientes reserven salón y fecha',
    'Consulta de disponibilidad en tiempo real',
    'Confirmación automática y notificaciones',
  ],
  'crm-avanzado': [
    'Seguimiento de leads y oportunidades de venta',
    'Historial de interacciones con cada cliente',
    'Recordatorios y tareas de seguimiento',
  ],
  'integracion-contabilidad': [
    'Exportación a formatos contables (libros diario, mayor)',
    'Sincronización con software contable (Zoho, QuickBooks, etc.)',
    'Reportes fiscales básicos',
  ],
  'sitio-web-eventos': [
    'Página pública con galería de eventos realizados',
    'Portafolio de salones y servicios',
    'Formulario de contacto integrado',
  ],
  instagram: [
    'Integración con APIs de Meta (Instagram)',
    'Publicación y programación de posts desde el sistema',
    'Gestión de comentarios y mensajes directos',
    'Métricas de alcance, interacciones y seguidores',
  ],
};

const EnConstruccion = () => {
  const location = useLocation();
  const moduloSlug = location.pathname.replace('/proximas/', '');
  const tituloModulo = TITULOS_POR_RUTA[moduloSlug] || moduloSlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Este módulo';
  const alcance = ALCANCE_POR_RUTA[moduloSlug] || [];

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          textAlign: 'center',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.5)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1.5rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.4)',
          }}
        >
          <Construction size={48} color="white" strokeWidth={2} />
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem',
          }}
        >
          {tituloModulo}
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: alcance.length ? '1.5rem' : '1.5rem',
          }}
        >
          Estamos trabajando para traerte esta funcionalidad pronto. Cada día sumamos nuevas herramientas para que gestiones tus eventos con mayor facilidad.
        </p>

        {alcance.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Alcance previsto
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                color: '#334155',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            >
              {alcance.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.9rem',
          }}
        >
          <Sparkles size={18} />
          <span>Próximamente disponible</span>
        </div>
      </div>
    </div>
  );
};

export default EnConstruccion;
