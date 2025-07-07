import { TradeEntryForm } from "@/components/forms/trade-entry-form";
import { Header } from "@/components/layout/header";

export default function Trades() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Trade Entry" 
        subtitle="Add and manage your trades"
      />
      <div className="p-6">
        <TradeEntryForm />
      </div>
    </div>
  );
}
