import React, { useEffect, useState } from 'react';
import { usuariosService, clientesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { User, Mail, Phone, Shield, FileText } from 'lucide-react';

const Perfil = () => {
  const { usuario } = useAuth();
  const { toasts, removeToast, error: showError, success } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [formPerfil, setFormPerfil] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
  });
  const [formClave, setFormClave] = useState({
    nueva_contrasena: '',
    confirmar_contrasena: '',
  });
  const [errorClave, setErrorClave] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoading(true);
        if (usuario?.id) {
          const data = await usuariosService.getById(usuario.id);
          const perfilData = data.usuario || usuario;
          setPerfil(perfilData);
          setFormPerfil({
            nombre_completo: perfilData?.nombre_completo || '',
            email: perfilData?.email || '',
            telefono: perfilData?.telefono || '',
          });
        } else {
          setPerfil(usuario || null);
          setFormPerfil({
            nombre_completo: usuario?.nombre_completo || '',
            email: usuario?.email || '',
            telefono: usuario?.telefono || '',
          });
        }
        try {
          const clienteResp = await clientesService.getMe();
          setCliente(clienteResp.cliente || null);
        } catch {
          setCliente(null);
        }
      } catch (err) {
        const mensaje = err.response?.data?.error || 'No se pudo cargar el perfil';
        showError(mensaje);
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, [usuario?.id, usuario, showError]);

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!perfil?.id) return;
    try {
      setGuardandoPerfil(true);
      const payload = {
        nombre_completo: formPerfil.nombre_completo,
        email: formPerfil.email || null,
        telefono: formPerfil.telefono || null,
        rol: perfil.rol,
        activo: perfil.activo !== undefined ? perfil.activo : true,
      };
      const data = await usuariosService.update(perfil.id, payload);
      setPerfil(data.usuario || { ...perfil, ...payload });
      success('Perfil actualizado');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo actualizar el perfil';
      showError(mensaje);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setErrorClave('');
    if (!perfil?.id) return;
    if (!formClave.nueva_contrasena) {
      setErrorClave('La nueva contraseña es requerida.');
      return;
    }
    if (formClave.nueva_contrasena !== formClave.confirmar_contrasena) {
      setErrorClave('Las contraseñas no coinciden.');
      return;
    }
    try {
      setGuardandoClave(true);
      await usuariosService.cambiarContrasena(perfil.id, formClave.nueva_contrasena);
      setFormClave({ nueva_contrasena: '', confirmar_contrasena: '' });
      success('Contraseña actualizada');
    } catch (err) {
      const mensaje = err.response?.data?.error || 'No se pudo cambiar la contraseña';
      showError(mensaje);
    } finally {
      setGuardandoClave(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando perfil...</div>;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mi perfil</h1>
        <p style={{ color: '#6b7280' }}>Consulta tu información personal y de cuenta.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Cuenta</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Nombre</div>
                <div style={{ fontWeight: '600' }}>{perfil?.nombre_completo || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Usuario</div>
                <div style={{ fontWeight: '600' }}>{perfil?.nombre_usuario || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Email</div>
                <div style={{ fontWeight: '600' }}>{perfil?.email || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Teléfono</div>
                <div style={{ fontWeight: '600' }}>{perfil?.telefono || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Rol</div>
                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{perfil?.rol || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Editar perfil</h2>
          <form onSubmit={handleGuardarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Nombre completo
              <input
                type="text"
                value={formPerfil.nombre_completo}
                onChange={(e) => setFormPerfil({ ...formPerfil, nombre_completo: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Email
              <input
                type="email"
                value={formPerfil.email}
                onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Teléfono
              <input
                type="text"
                value={formPerfil.telefono}
                onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                }}
              />
            </label>
            <button
              type="submit"
              disabled={guardandoPerfil}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '0.4rem',
                border: 'none',
                backgroundColor: '#6366f1',
                color: 'white',
                fontWeight: '600',
                cursor: guardandoPerfil ? 'not-allowed' : 'pointer',
              }}
            >
              {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Cambiar contraseña</h2>
          <form onSubmit={handleCambiarContrasena} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Nueva contraseña
              <input
                type="password"
                value={formClave.nueva_contrasena}
                onChange={(e) => setFormClave({ ...formClave, nueva_contrasena: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Confirmar contraseña
              <input
                type="password"
                value={formClave.confirmar_contrasena}
                onChange={(e) => setFormClave({ ...formClave, confirmar_contrasena: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                }}
              />
            </label>
            {errorClave && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                {errorClave}
              </div>
            )}
            <button
              type="submit"
              disabled={guardandoClave}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '0.4rem',
                border: 'none',
                backgroundColor: '#111827',
                color: 'white',
                fontWeight: '600',
                cursor: guardandoClave ? 'not-allowed' : 'pointer',
              }}
            >
              {guardandoClave ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        {cliente && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Datos de cliente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Documento</div>
                <div style={{ fontWeight: '600' }}>{cliente?.documento_identidad || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Dirección</div>
                <div style={{ fontWeight: '600' }}>{cliente?.direccion || '-'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
