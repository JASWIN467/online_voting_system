import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3200);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, display: 'grid', gap: 10, zIndex: 3000 }}>
        {toasts.map((toast) => {
          const bg =
            toast.type === 'success'
              ? 'rgba(34, 197, 94, 0.16)'
              : toast.type === 'error'
              ? 'rgba(248, 113, 113, 0.16)'
              : 'rgba(79, 124, 255, 0.16)';
          const border =
            toast.type === 'success' ? 'rgba(34, 197, 94, 0.55)' : toast.type === 'error' ? 'rgba(248, 113, 113, 0.55)' : 'rgba(79, 124, 255, 0.55)';
          return (
            <div
              key={toast.id}
              className="glass-card"
              style={{ minWidth: 280, maxWidth: 380, padding: '12px 14px', background: bg, borderColor: border }}
            >
              <p style={{ color: 'white', fontSize: '0.92rem' }}>{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

