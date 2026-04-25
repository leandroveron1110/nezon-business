import { IOrder, PaymentMethodType, DeliveryType } from "../../types/order";

interface OrderTicketProps {
  order: IOrder;
  mode: 'KITCHEN' | 'CUSTOMER';
}

const PAYMENT_LABELS: Record<PaymentMethodType, string> = {
  [PaymentMethodType.CASH]: "EFECTIVO",
  [PaymentMethodType.TRANSFER]: "TRANSFERENCIA",
  [PaymentMethodType.DELIVERY]: "PAGO EN ENTREGA",
};

export function OrderTicket({ order, mode }: OrderTicketProps) {
  const isKitchen = mode === 'KITCHEN';

  return (
    // Ancho fijo de 80mm para ticketera estándar y overflow-hidden para evitar desbordes
    <div className="hidden print:block p-2 text-black font-mono leading-tight w-[80mm] bg-white overflow-hidden mx-auto">
      
      {/* CABECERA */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        {isKitchen ? (
          <h1 className="text-2xl font-black border-2 border-black px-1 uppercase">COMANDA</h1>
        ) : (
          <h1 className="text-xl font-black italic tracking-tighter">LOCUS</h1>
        )}
        <p className="text-[10px] font-bold mt-1">
          #{order.id.slice(-6).toUpperCase()} — {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
        </p>
      </div>

      {/* DATOS CLIENTE (Solo Cliente) */}
      {!isKitchen && (
        <div className="mb-2 text-[10px] border-b border-black pb-2">
          <p className="font-black text-sm uppercase">{order.user.fullName}</p>
          <p>TEL: {order.user.phone}</p>
          {order.deliveryType === DeliveryType.DELIVERY ? (
            <div className="mt-1 p-1 bg-black text-white text-center font-bold uppercase text-xs">
              ENTREGA A DOMICILIO
              <p className="text-[9px] mt-0.5">{order.user.address || "S/D"}</p>
            </div>
          ) : (
            <p className="mt-1 p-1 border border-black text-center font-bold text-xs uppercase">RETIRA EN LOCAL</p>
          )}
        </div>
      )}

      {/* DETALLE PRODUCTOS */}
      <div className="mb-2">
        {isKitchen && <p className="text-center font-bold border-b border-black mb-2 text-xs">PREPARACIÓN</p>}
        
        {order.items.map((item) => (
          <div key={item.id} className="mb-2 border-b border-gray-100 pb-1">
            <div className="flex justify-between items-start">
              <span className={`flex-1 uppercase font-black ${isKitchen ? 'text-lg' : 'text-sm'}`}>
                {item.quantity} x {item.productName}
              </span>
              {!isKitchen && (
                <span className="font-bold text-sm">${(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
              )}
            </div>

            {item.optionGroups.flatMap(g => g.options).map(o => (
              <div key={o.id} className={`ml-4 italic ${isKitchen ? 'text-sm font-bold' : 'text-[9px]'}`}>
                + {o.optionName}
              </div>
            ))}

            {item.notes && (
              <div className={`ml-2 mt-1 p-1 border-l-4 border-black ${isKitchen ? 'bg-gray-200 text-sm font-black' : 'text-[9px] italic'}`}>
                ¡OJO!: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TOTALES (Solo Cliente) */}
      {!isKitchen && (
        <div className="border-t-2 border-black pt-2">
          {order.customerObservations && (
            <div className="mb-2 p-1 border border-black border-dashed text-[9px]">
              <p className="font-bold uppercase">Obs:</p>
              <p className="italic leading-none">"{order.customerObservations}"</p>
            </div>
          )}
          <div className="flex justify-between items-center border-t-2 border-black pt-1 mt-1">
            <span className="text-sm font-black">TOTAL:</span>
            <span className="text-2xl font-black italic">${order.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* PIE (Solo Cliente) */}
      {!isKitchen && (
        <div className="text-center mt-4 border-t border-black pt-2">
          <p className="text-[10px] font-black italic uppercase">Gracias por elegir Locus</p>
        </div>
      )}
    </div>
  );
}