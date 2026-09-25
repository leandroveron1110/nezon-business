import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";

interface ProductRowProps {
  product: InventoryProductModel;
  onSelect: (product: InventoryProductModel) => void;
  onEdit: (product: InventoryProductModel) => void;
}

export default function ProductRow({
  product,
  onSelect,
  onEdit,
}: ProductRowProps) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-3">
        {product.code ?? "—"}
      </td>

      <td className="px-4 py-3 font-medium">
        {product.name}
      </td>

      <td className="px-4 py-3">
        {product.minStock ?? "—"}
      </td>

      <td className="px-4 py-3">
        {product.maxStock ?? "—"}
      </td>

      <td className="px-4 py-3">
        {product.trackLots ? "Sí" : "No"}
      </td>

      <td className="px-4 py-3">
        {product.isActive ? "Activo" : "Inactivo"}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="hover:underline"
          >
            Ver
          </button>

          <button
            type="button"
            onClick={() => onEdit(product)}
            className="hover:underline"
          >
            Editar
          </button>
        </div>
      </td>
    </tr>
  );
}