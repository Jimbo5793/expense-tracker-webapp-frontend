import React from 'react';
import { useToast } from '../context/ToastContext';

const TOAST_ICONS = { success: '✅', danger: '❌', info: 'ℹ️', warning: '⚠️' };

const Toast = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`} onClick={() => removeToast(toast.id)}>
                    <span>{TOAST_ICONS[toast.type] || '🔔'}</span>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default Toast;
