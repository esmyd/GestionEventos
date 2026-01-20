import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="white" />;
      case 'error':
        return <XCircle size={20} color="white" />;
      case 'warning':
        return <AlertCircle size={20} color="white" />;
      case 'info':
        return <Info size={20} color="white" />;
      default:
        return <CheckCircle2 size={20} color="white" />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      minWidth: '300px',
      maxWidth: '500px',
      animation: 'slideIn 0.3s ease-out',
      position: 'relative',
      zIndex: 9999,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#10b981',
          color: 'white',
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#ef4444',
          color: 'white',
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#f59e0b',
          color: 'white',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#3b82f6',
          color: 'white',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#10b981',
          color: 'white',
        };
    }
  };

  return (
    <div style={getStyles()}>
      <div style={{ flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500' }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          opacity: 0.8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        <X size={18} />
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
