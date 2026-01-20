import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { checkApiHealth } from '../utils/healthCheck';
import { LogIn, User, Lock, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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

  const usuariosPrueba = [
    { usuario: 'admin', contrasena: 'admin123', rol: 'Administrador' },
    { usuario: 'gerente', contrasena: 'gerente123', rol: 'Gerente General' },
    { usuario: 'coordinador1', contrasena: 'coordinador123', rol: 'Coordinador' },
  ];

  const handleUsuarioPrueba = (usuario, contrasena) => {
    setNombreUsuario(usuario);
    setContrasena(contrasena);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Partículas animadas de fondo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '3rem',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideIn 0.5s ease-out',
        }}
      >
        {/* Logo/Icono animado */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: '1rem',
              boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Sparkles size={40} color="white" />
          </div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em',
            }}
          >
            Lirios Eventos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500' }}>
            Sistema de Gestión de Eventos
          </p>
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

          {apiAvailable === true && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Servidor conectado</span>
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

          <div style={{ marginBottom: '1.5rem' }}>
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
                  color: focusedField === 'usuario' ? '#6366f1' : '#9ca3af',
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
                  border: `2px solid ${focusedField === 'usuario' ? '#6366f1' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: focusedField === 'usuario' ? '#f9fafb' : 'white',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
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
                  color: focusedField === 'contrasena' ? '#6366f1' : '#9ca3af',
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
                  border: `2px solid ${focusedField === 'contrasena' ? '#6366f1' : '#e5e7eb'}`,
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: focusedField === 'contrasena' ? '#f9fafb' : 'white',
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
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')}
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
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || apiAvailable === false ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow:
                loading || apiAvailable === false
                  ? 'none'
                  : '0 10px 25px -5px rgba(102, 126, 234, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!loading && apiAvailable !== false) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && apiAvailable !== false) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(102, 126, 234, 0.4)';
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
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            Volver al inicio
          </Link>
        </div>

        {/* Usuarios de prueba mejorados */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User size={18} color="#6366f1" />
            <strong style={{ fontSize: '0.875rem', color: '#374151' }}>Usuarios de prueba:</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {usuariosPrueba.map((usuario, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleUsuarioPrueba(usuario.usuario, usuario.contrasena)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {usuario.usuario} / {usuario.contrasena}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {usuario.rol}
                  </div>
                </div>
                <LogIn size={16} color="#6366f1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
