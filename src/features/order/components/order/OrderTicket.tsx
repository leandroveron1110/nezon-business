// features/orders/components/OrderTicket.tsx
import { IOrder } from "../../types/order";
import { formatPrice } from "@/features/common/utils/formatPrice";

export const OrderTicket = ({ order }: { order: IOrder }) => {
  return (
    <div className="print-only" style={{ width: "80mm", padding: "2mm", fontFamily: "monospace" }}>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        {/* <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{order.bussiness.name}</h2> */}
        <p>Orden #{order.id.slice(-6).toUpperCase()}</p>
        <p>{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div style={{ borderBottom: "1px dashed black", margin: "10px 0" }} />

      {/* ITEMS */}
      <div>
        {order.items.map((item) => (
          <div key={item.id} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>{item.quantity} x {item.productName}</span>
              <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
            </div>
            {item.optionGroups.flatMap(g => g.options).map(o => (
              <div key={o.id} style={{ fontSize: "0.8rem", marginLeft: "10px" }}>
                + {o.optionName}
              </div>
            ))}
            {item.notes && (
              <div style={{ fontSize: "0.8rem", fontWeight: "bold", marginTop: "2px" }}>
                NOTA: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderBottom: "1px dashed black", margin: "10px 0" }} />

      {/* TOTALES */}
      <div style={{ fontSize: "1.2rem", fontWeight: "black", display: "flex", justifyContent: "space-between" }}>
        <span>TOTAL:</span>
        <span>{formatPrice(order.total)}</span>
      </div>
      <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
        Pago: {order.orderPaymentMethod === 'CASH' ? 'EFECTIVO' : 'TRANSFERENCIA'}
      </p>

      <div style={{ borderBottom: "1px dashed black", margin: "10px 0" }} />

      {/* DATOS DE ENTREGA */}
      <div>
        <p><strong>CLIENTE:</strong> {order.user.fullName}</p>
        <p><strong>TEL:</strong> {order.user.phone}</p>
        {order.deliveryType !== 'PICKUP' && (
          <p><strong>DIR:</strong> {order.user.address}</p>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>Gracias por elegirnos</p>
        <p>Locus - Concepción del Uruguay</p>
      </div>
    </div>
  );
};