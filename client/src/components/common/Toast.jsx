import React from 'react';
import { useCloud } from '../../context/CloudContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useCloud();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
        let borderClass = 'border-emerald-300';
        let bgClass = 'bg-white';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
          borderClass = 'border-rose-300';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
          borderClass = 'border-amber-300';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-slateBlue flex-shrink-0" />;
          borderClass = 'border-slateBlue/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} shadow-lg transition-all duration-200 transform translate-y-0`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium text-charcoal leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-charcoal/50 hover:text-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
