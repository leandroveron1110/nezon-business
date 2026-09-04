import { formatPrice } from "@/features/common/utils/formatPrice";
import { OrderItem } from "@/features/order/types/order";

interface OrderItemsListProps {
  items: OrderItem[];
}
export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {items.map((item, i) => (
        <div
          key={`${item.id}-${i}`}
          className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3 flex-1">
              <span className="font-black bg-slate-900 p-1 text-white min-w-[24px] h-[24px] flex items-center justify-center rounded text-xs shadow-sm">
                {item.quantity}
              </span>
              <div className="space-y-1 flex-1">
                <p className="font-bold text-slate-900 leading-tight text-sm uppercase tracking-tight">
                  {item.productName}
                </p>

                {item.notes && (
                  <p className="text-[11px] text-amber-600 font-bold leading-tight italic whitespace-pre-line">
                    Nota: "{item.notes}"
                  </p>
                )}

                {item.optionGroups?.length > 0 && (
                  <div className="space-y-0.5 pt-0.5">
                    {item.optionGroups
                      .flatMap((g) => g.options)
                      .map((o, idx) => (
                        <div
                          key={o.id || idx}
                          className="flex justify-between items-center text-[11px] text-slate-600 font-medium leading-tight"
                        >
                          <span>• {o.optionName}</span>
                          {o.priceFinal > 0 && (
                            <span className="font-mono text-slate-500 font-semibold ml-2">
                              +{formatPrice(o.priceFinal * item.quantity)}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <p className="font-mono font-bold text-slate-700 text-xs mt-0.5 whitespace-nowrap">
              {formatPrice(item.priceAtPurchase * item.quantity)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}