import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { checkApiHealth } from '../utils/healthCheck';
import { LogIn, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { configuracionesService } from '../services/api';

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginConfig, setLoginConfig] = useState({
    nombre_plataforma: 'Lirios Eventos',
    login_titulo: 'Bienvenido de vuelta',
    login_subtitulo: 'Ingresa con tu usuario y contrasena.',
    login_boton_texto: 'Ingresar',
    login_left_titulo: 'Tu evento, organizado sin estres',
    login_left_texto: 'Reserva tu fecha, gestiona pagos y coordina cada detalle desde un solo lugar.',
    login_left_items: 'Fechas y horarios en un clic\nPagos y recordatorios automatizados\nClientes informados en tiempo real\nReportes claros para tu equipo',
    login_left_imagen: '',
    login_acento_color: '#16a34a',
    login_fondo_color: '#0f766e',
  });

  useEffect(() => {
    // Verificar si el servidor API está disponible al cargar la página
    const verifyApi = async () => {
      try {
        const health = await checkApiHealth();
        setApiAvailable(health.available);
        if (!health.available) {
          setError('El servidor API no está disponible. Asegúrate de que esté corriendo en http://localhost:5000');
        }
      } catch (err) {
        console.error('Error al verificar API:', err);
        setApiAvailable(false);
      }
    };
    verifyApi();
  }, []);

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const data = await configuracionesService.getGeneralPublic();
        const conf = data?.configuracion || {};
        setLoginConfig((prev) => ({
          ...prev,
          ...conf,
        }));
      } catch (err) {
        // Mantener valores por defecto
      }
    };
    cargarConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!nombreUsuario || !contrasena) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(nombreUsuario, contrasena);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error inesperado al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const promoItems = (loginConfig.login_left_items || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div
      className="login-layout"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        background: '#ffffff',
      }}
    >
      <div
        className="login-left"
        style={{
          color: 'white',
          padding: '3rem 3.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2.5rem',
          backgroundColor: loginConfig.login_fondo_color || '#0f766e',
          backgroundImage: loginConfig.login_left_imagen
            ? `linear-gradient(180deg, rgba(31, 41, 55, 0.55), rgba(31, 41, 55, 0.75)), url("${loginConfig.login_left_imagen}")`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', opacity: 0.85, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            {loginConfig.nombre_plataforma}
          </div>
          <div style={{ fontSize: '2.35rem', fontWeight: 600, marginBottom: '0.9rem', lineHeight: 1.25 }}>
            {loginConfig.login_left_titulo}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, fontSize: '1rem', fontWeight: 400 }}>
            {loginConfig.login_left_texto}
          </div>
          {promoItems.length > 0 && (
            <ul
              style={{
                marginTop: '1.4rem',
                paddingLeft: 0,
                listStylePosition: 'inside',
                lineHeight: 2,
                fontSize: '0.95rem',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {promoItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {loginConfig.login_left_texto}
        </div>
      </div>

      <div
        className="login-right"
        style={{
          padding: '3.25rem 3.5rem',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827' }}>
            {loginConfig.login_titulo}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.35rem' }}>
            {loginConfig.login_subtitulo}
          </div>
          </div>

          <form onSubmit={handleSubmit}>
            {apiAvailable === false && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                border: '1px solid #fbbf24',
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <strong>⚠️ Servidor API no disponible</strong>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Por favor, inicia el servidor API ejecutando:{' '}
                  <code
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '0.25rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    python api_server.py
                  </code>
                </div>
              </div>
            </div>
          )}

            {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                animation: 'slideIn 0.3s ease-out',
                border: '1px solid #fca5a5',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>{error}</span>
            </div>
          )}

            <div style={{ marginBottom: '1.35rem' }}>
            <label
              htmlFor="usuario"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Usuario
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '1rem',
                  zIndex: 1,
                  color: focusedField === 'usuario' ? (loginConfig.login_acento_color || '#16a34a') : '#9ca3af',
                  transition: 'color 0.2s',
                }}
              >
                <User size={20} />
              </div>
                <input
                id="usuario"
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                onFocus={() => setFocusedField('usuario')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Ingrese su usuario"
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                    border: `1px solid ${focusedField === 'usuario' ? (loginConfig.login_acento_color || '#16a34a') : '#e5e7eb'}`,
                    borderRadius: '0.65rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                    backgroundColor: 'white',
                }}
              />
            </div>
          </div>

            <div style={{ marginBottom: '1.75rem' }}>
            <label
              htmlFor="contrasena"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Contraseña
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '1rem',
                  zIndex: 1,
                  color: focusedField === 'contrasena' ? (loginConfig.login_acento_color || '#16a34a') : '#9ca3af',
                  transition: 'color 0.2s',
                }}
              >
                <Lock size={20} />
              </div>
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                onFocus={() => setFocusedField('contrasena')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Ingrese su contraseña"
                style={{
                  width: '100%',
                  padding: '0.875rem 3rem 0.875rem 3rem',
                  border: `1px solid ${focusedField === 'contrasena' ? (loginConfig.login_acento_color || '#16a34a') : '#e5e7eb'}`,
                  borderRadius: '0.65rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: 'white',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = loginConfig.login_acento_color || '#16a34a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                {showPassword ? <Lock size={18} /> : <Lock size={18} />}
              </button>
            </div>
          </div>

            <button
            type="submit"
            disabled={loading || apiAvailable === false}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading || apiAvailable === false
                ? '#9ca3af'
                : (loginConfig.login_acento_color || '#16a34a'),
              color: 'white',
              border: 'none',
              borderRadius: '0.65rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || apiAvailable === false ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: loading || apiAvailable === false
                ? 'none'
                : '0 12px 20px rgba(15, 23, 42, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!loading && apiAvailable !== false) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 18px 28px rgba(15, 23, 42, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && apiAvailable !== false) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(15, 23, 42, 0.15)';
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Iniciando sesión...</span>
              </>
            ) : apiAvailable === false ? (
              <>
                <AlertCircle size={20} />
                <span>Servidor no disponible</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>{loginConfig.login_boton_texto || 'Ingresar'}</span>
              </>
            )}
            </button>
          </form>
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                color: loginConfig.login_acento_color || '#16a34a',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 960px) {
          .login-layout {
            grid-template-columns: 1fr;
          }
          .login-left {
            padding: 2rem;
            min-height: 45vh;
          }
          .login-right {
            padding: 2rem 1.5rem;
            align-items: flex-start;
          }
        }
        @media (max-width: 600px) {
          .login-left {
            padding: 1.5rem;
            min-height: 40vh;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
