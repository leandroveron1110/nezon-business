import { Utensils, Receipt, X, MessageCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Cambiamos el tipo para soportar la acción de WhatsApp
  onSelect: (mode: 'KITCHEN' | 'CUSTOMER' | 'SHARE_WHATSAPP') => void;
}

export function PrintSelectorModal({ isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[340px] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gestionar Comprobante</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-3">
          {/* OPCIÓN: COMANDA (Cocina) */}
          <button 
            onClick={() => onSelect('KITCHEN')}
            className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Utensils size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-gray-900 uppercase">Imprimir Comanda</p>
              <p className="text-[9px] text-gray-500 font-bold italic">Para preparación en cocina</p>
            </div>
          </button>

          {/* OPCIÓN: TICKET (Cliente - Impreso) */}
          <button 
            onClick={() => onSelect('CUSTOMER')}
            className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Receipt size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-gray-900 uppercase">Imprimir Ticket</p>
              <p className="text-[9px] text-gray-500 font-bold italic">Para entregar al cliente</p>
            </div>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[8px] uppercase font-black text-gray-300 bg-white px-2">O digital</div>
          </div>

          {/* OPCIÓN: WHATSAPP (Digital) */}
          <button 
            onClick={() => onSelect('SHARE_WHATSAPP')}
            className="flex items-center gap-4 p-4 border-2 border-green-50 bg-green-50/30 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="p-2 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <MessageCircle size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-green-700 uppercase">Enviar por WhatsApp</p>
              <p className="text-[9px] text-green-600/70 font-bold italic">Manda el ticket al cliente</p>
            </div>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest transition-colors"
        >
          Cerrar menú
        </button>
      </div>
    </div>
  );
}