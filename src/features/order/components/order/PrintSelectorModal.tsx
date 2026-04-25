// src/features/business/components/PrintSelectorModal.tsx
import { Utensils, Receipt, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'KITCHEN' | 'CUSTOMER') => void;
}

export function PrintSelectorModal({ isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Tipo de Impresión</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20} /></button>
        </div>

        <div className="grid gap-3">
          {/* OPCIÓN: COMANDA */}
          <button 
            onClick={() => onSelect('KITCHEN')}
            className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Utensils size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-gray-900 uppercase">Solo Cocina</p>
              <p className="text-[10px] text-gray-500 font-bold italic">Resumen de preparación</p>
            </div>
          </button>

          {/* OPCIÓN: TICKET CLIENTE */}
          <button 
            onClick={() => onSelect('CUSTOMER')}
            className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Receipt size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-gray-900 uppercase">Solo Cliente</p>
              <p className="text-[10px] text-gray-500 font-bold italic">Detalle de precios y envío</p>
            </div>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}