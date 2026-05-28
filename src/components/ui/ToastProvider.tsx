'use client';

import React, { createContext, useState, useCallback } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastContextType {
  activeToast: { message: string; type: ToastType } | null;
  showToast: (message: string, type: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeToast, setActiveToast] = useState<{ message: string; type: ToastType } | null>(null);

  const hideToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    // Instantly replace any active toast to keep feedback responsive and uncluttered
    setActiveToast({ message, type });
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider
      value={{
        activeToast,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC = () => {
  const context = React.useContext(ToastContext);
  if (!context || !context.activeToast) return null;

  const { activeToast, hideToast } = context;

  return (
    <div 
      className="absolute top-[68px] left-0 right-0 z-[110] px-4 pointer-events-none flex justify-center w-full"
    >
      <Toast 
        message={activeToast.message} 
        type={activeToast.type} 
        onClose={hideToast} 
      />
    </div>
  );
};
