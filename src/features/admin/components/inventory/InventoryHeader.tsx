export default function InventoryHeader() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">
          Inventario
        </h1>

        <p className="text-sm text-muted-foreground">
          Gestioná productos, stock y movimientos.
        </p>
      </div>
    </header>
  );
}