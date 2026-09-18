// components/OrderActions/MenuHeader.tsx
import { ArrowLeft } from "lucide-react";

interface MenuHeaderProps {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
}

export function MenuHeader({ title, icon, onBack }: MenuHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
      <button
        type="button"
        onClick={onBack}
        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
        {icon}
        {title}
      </div>
    </div>
  );
}
