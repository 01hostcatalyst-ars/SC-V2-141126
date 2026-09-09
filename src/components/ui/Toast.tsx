"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 transition-all duration-200 ${
              toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200/80 text-emerald-900"
                : toast.type === "error"
                ? "bg-rose-50/95 border-rose-200/80 text-rose-900"
                : "bg-zinc-900 text-white border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />}
              {toast.type === "info" && <Info className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={2} />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
