import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";
import ProductRow from "./ProductRow";


interface ProductTableProps {
  products: InventoryProductModel[];
  onSelect: (product: InventoryProductModel) => void;
  onEdit: (product: InventoryProductModel) => void;
}

export default function ProductTable({
  products,
  onSelect,
  onEdit,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border p-10 text-center">
        <p className="font-medium">
          No hay productos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Producto</th>
            <th className="px-4 py-3 text-left">Mínimo</th>
            <th className="px-4 py-3 text-left">Máximo</th>
            <th className="px-4 py-3 text-left">Lotes</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.idTemp}
              product={product}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}