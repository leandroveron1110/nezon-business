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
    <div className="text-black font-mono leading-tight w-[80mm] bg-white border-none antialiased">
      <div className="p-1">
        
        {/* CABECERA */}
        <div className="text-center border-b-2 border-black pb-2 mb-2">
          {isKitchen ? (
            <div className="mb-1">
              <h1 className="text-2xl font-black border-2 border-black px-2 uppercase inline-block">
                COMANDA
              </h1>
              {/* Nombre en grande pero sin fondo negro para cuidar la impresora */}
              <p className="text-xl font-black mt-1 uppercase block border-b-4 border-black pb-1 break-words">
                {order.user.fullName}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black italic tracking-tighter">LOCUS</h1>
              <p className="text-[9px] font-bold uppercase leading-none mb-1">
                Comprobante de Pedido Interno
              </p>
            </>
          )}
          
          <div className="flex justify-between items-center px-1 mt-1 font-bold">
            <p className="text-[12px]">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-[12px]">
              {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
            </p>
          </div>
        </div>

        {/* DATOS DE ENTREGA / CLIENTE */}
        <div className="mb-2 text-[11px] border-b border-black pb-2">
          {!isKitchen && (
            <p className="font-black text-[13px] uppercase break-words mb-1">
              CLIENTE: {order.user.fullName}
            </p>
          )}
          
          <div className="flex justify-between flex-wrap">
            {/* Teléfono solo para el cliente/cadete, no para cocina */}
            {!isKitchen && <span>TEL: {order.user.phone}</span>}
            
            {!isKitchen && (
              <span className="font-bold">PAGO: {PAYMENT_LABELS[order.orderPaymentMethod]}</span>
            )}
          </div>
          
          {order.deliveryType === DeliveryType.DELIVERY ? (
            <div className="mt-1 p-1 border-2 border-black text-center font-black uppercase text-[12px] break-words">
              ENVÍO A DOMICILIO
              <p className="text-[10px] mt-0.5 normal-case font-bold italic leading-tight">
                {order.user.address || "Dirección no especificada"}
              </p>
            </div>
          ) : (
            <p className="mt-1 p-1 border-2 border-black text-center font-black text-[12px] uppercase">
              RETIRA EN LOCAL
            </p>
          )}
        </div>

        {/* DETALLE PRODUCTOS */}
        <div className="mb-2">
          {order.items.map((item) => (
            <div key={item.id} className="mb-3 border-b border-gray-300 pb-2 last:border-0">
              <div className="flex justify-between items-start gap-2">
                <span className={`flex-1 uppercase font-black break-words leading-none ${isKitchen ? 'text-[16px]' : 'text-[13px]'}`}>
                  {item.quantity} x {item.productName}
                </span>
                {!isKitchen && (
                  <span className="font-bold text-[13px] whitespace-nowrap">
                    ${(item.priceAtPurchase * item.quantity).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Opciones y Agregados */}
              {item.optionGroups?.flatMap(g => g.options).map(o => (
                <div key={o.id} className={`ml-4 italic uppercase break-words ${isKitchen ? 'text-[11px] font-bold' : 'text-[10px]'}`}>
                  + {o.optionName}
                </div>
              ))}

              {/* Notas específicas por producto */}
              {item.notes && (
                <div className={`ml-2 mt-1 p-1 border-l-4 border-black break-words ${isKitchen ? 'bg-gray-100 text-[12px] font-black' : 'text-[10px] italic'}`}>
                  NOTA: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* TOTALES (Solo Modo Cliente) */}
        {!isKitchen && (
          <div className="border-t-4 border-black pt-2">
            {order.customerObservations && (
              <div className="mb-2 p-1 border border-black border-dashed text-[10px]">
                <p className="font-black uppercase text-[9px]">Notas Generales:</p>
                <p className="leading-tight italic break-words">"{order.customerObservations}"</p>
              </div>
            )}
            <div className="flex justify-between items-end">
              <span className="text-[12px] font-black">TOTAL:</span>
              <span className="text-3xl font-black italic leading-none">
                ${order.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* PIE DE TICKET - Espaciado para la cuchilla */}
        {!isKitchen && (
          <div className="text-center mt-6 border-t border-black pt-2">
            <p className="text-[11px] font-black italic uppercase">¡Gracias por tu compra!</p>
            <p className="text-[10px] font-bold">www.locus.com.ar</p>
          </div>
        )}
        
        {/* Padding final: 3cm aproximadamente para que el texto no quede debajo de la tapa/cuchilla */}
        <div className="h-20" />
      </div>
    </div>
  );
}