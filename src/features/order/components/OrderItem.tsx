// src/components/OrderItem.tsx
"use client";

import { OrderItem as TOrderItem } from "../types/order";
import { Utensils } from "lucide-react";

interface Props {
  item: TOrderItem;
}

export default function OrderItem({ item }: Props) {
  const totalItemPrice = item.priceAtPurchase * item.quantity;

  return (
    <div className="flex flex-col space-y-1 p-2 bg-gray-50 rounded-md border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <p className="font-semibold text-gray-800">
            {item.productName} × {item.quantity}
          </p>
        </div>
        <p className="text-sm font-bold text-right">${totalItemPrice.toFixed(2)}</p>
      </div>
      
      {/* Opciones y notas */}
      <div className="flex flex-col text-sm text-gray-600 ml-6">
        {item.optionGroups.map((group) => (
          <div key={group.id} className="mt-1">
            <p className="font-medium text-gray-700">
              {group.groupName}:
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs text-gray-500">
              {group.options.map((opt) => (
                <li key={opt.id}>
                  {opt.optionName} × {opt.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {item.notes && (
          <div className="mt-2">
            <p className="italic text-gray-600">
              Nota: {item.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}