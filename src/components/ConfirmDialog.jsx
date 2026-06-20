import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', onConfirm, onCancel }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const styles = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-red-500" />,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-300',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-300',
    },
    info: {
      icon: <Info className="h-6 w-6 text-blue-500" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300',
    },
  };

  const s = styles[type] || styles.danger;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in fade-in zoom-in duration-200"
      >
        <button onClick={onCancel} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
            {s.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${s.confirmBtn} transition-colors focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
