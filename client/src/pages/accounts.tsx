import { AccountTrackerForm } from "@/components/forms/account-tracker-form";
import { Header } from "@/components/layout/header";

export default function Accounts() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Account Trackers" 
        subtitle="Create and manage your trading accounts"
      />
      <div className="p-6">
        <AccountTrackerForm />
      </div>
    </div>
  );
}
