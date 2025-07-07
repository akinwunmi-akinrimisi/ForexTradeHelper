import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onNewTrade?: () => void;
}

export function Header({ title, subtitle, onNewTrade }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        {onNewTrade && (
          <div className="flex items-center space-x-4">
            <Button onClick={onNewTrade} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Trade
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
