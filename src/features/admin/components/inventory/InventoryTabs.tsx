type InventorySection =
  | "products"
  | "stock"
  | "locations"
  | "presentation"
  | "settings";

interface InventoryTabsProps {
  section: InventorySection;
  onChange: (section: InventorySection) => void;
}

const tabs: {
  id: InventorySection;
  label: string;
}[] = [
  {
    id: "products",
    label: "Productos",
  },
  {
    id: "stock",
    label: "Stock",
  },
  {
    id: "locations",
    label: "Ubicaciones",
  },
  {
    id: "settings",
    label: "Configuración",
  },
    {
    id: "presentation",
    label: "Presentacion",
  },
];

export default function InventoryTabs({
  section,
  onChange,
}: InventoryTabsProps) {
  return (
    <nav className="flex gap-1 border-b px-6">
      {tabs.map((tab) => {
        const active = section === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "border-b-2 px-4 py-3 text-sm font-medium transition",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}