import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

// ============================================
// TOAST CONTAINER
// ============================================

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {/* Screen reader announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {toasts.map((toast) => (
          <div key={toast.id}>
            {toast.type === 'error' ? 'Error: ' : toast.type === 'warning' ? 'Warning: ' : ''}
            {toast.message}
          </div>
        ))}
      </div>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </div>
  );
}

// ============================================
// TOAST ITEM
// ============================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  index: number;
}

const iconConfig: Record<ToastType, { icon: typeof CheckCircle2; className: string; bgClass: string; borderClass: string }> = {
  success: { icon: CheckCircle2, className: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-l-emerald-500' },
  error: { icon: XCircle, className: 'text-red-600', bgClass: 'bg-red-50', borderClass: 'border-l-red-500' },
  warning: { icon: AlertCircle, className: 'text-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-l-amber-500' },
  info: { icon: Info, className: 'text-blue-600', bgClass: 'bg-blue-50', borderClass: 'border-l-blue-500' },
};

function ToastItem({ toast, onDismiss, index }: ToastItemProps) {
  const config = iconConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4
        bg-surface-card/95 backdrop-blur-md
        border border-surface-border border-l-4 ${config.borderClass}
        rounded-xl shadow-lg
        pointer-events-auto
        animate-slide-in-right
        transition-all duration-300
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      role="alert"
    >
      <div className={`p-1.5 rounded-lg ${config.bgClass} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.className} ${toast.type === 'success' ? 'animate-bounce-once' : ''}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary font-medium">
          {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Warning' : 'Info'}
        </p>
        <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-lighter rounded-lg transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
