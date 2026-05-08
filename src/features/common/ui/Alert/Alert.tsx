"use client";

// 💡 Importar useCallback
import { createContext, useContext, useState, ReactNode, useCallback } from "react"; 
import { X } from "lucide-react";
import { UI_COLORS } from "../../utils/ui";

export type AlertType = "success" | "error" | "info";

export interface AlertData {
  id: string;
  message: string;
  type?: AlertType;
  duration?: number; // ms, opcional para autodestruir
}

interface AlertContextProps {
  addAlert: (alert: Omit<AlertData, "id">) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert debe usarse dentro de AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 5000;

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, [setAlerts]); // setAlerts es la única dependencia externa aquí.

  // 2. Envolver addAlert en useCallback
  // addAlert depende de removeAlert (para el setTimeout), por lo tanto, removeAlert debe estar en sus dependencias.
  const addAlert = useCallback((alert: Omit<AlertData, "id">) => {
    const id = crypto.randomUUID();

    const autoCloseDuration = alert.duration ?? DEFAULT_DURATION;

    const newAlert: AlertData = {
      ...alert,
      id,
      duration: autoCloseDuration,
    };

    setAlerts((prev) => [...prev, newAlert]);
    
    // Al usar la `removeAlert` que es estable gracias a useCallback, no hay problemas.
    setTimeout(() => removeAlert(id), autoCloseDuration);
  }, [removeAlert, setAlerts]); // Depende de removeAlert y setAlerts.

return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((alert) => {
          // Mapeamos el tipo de alerta a nuestro diccionario global
          const variant = 
            alert.type === "success" ? UI_COLORS.SUCCESS :
            alert.type === "error"   ? UI_COLORS.ERROR : 
            UI_COLORS.INFO;

          return (
            <div
              key={alert.id}
              className={`
                ${variant.bg} 
                ${variant.text} 
                ${variant.border}
                border
                p-4 
                rounded-lg 
                shadow-lg 
                flex 
                items-start 
                justify-between 
                min-w-[250px]
                transition-all
              `}
            >
              <p className="text-sm font-medium">{alert.message}</p>
              <button onClick={() => removeAlert(alert.id)} className="ml-2 opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
};