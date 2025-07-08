import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  PlusCircle, 
  ClipboardList,
  User
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Trade Entry', href: '/trades', icon: PlusCircle },
  { name: 'Account Trackers', href: '/accounts', icon: Wallet },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Trading Plans', href: '/trading-plans', icon: ClipboardList },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">
          <BarChart3 className="inline mr-2 h-5 w-5 text-blue-400" />
          Forex Assistant
        </h1>
      </div>
      <div className="flex-1 py-4">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <span className={cn(
                    "flex items-center py-2 px-3 rounded-lg transition-colors cursor-pointer",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "hover:bg-slate-800 text-gray-300"
                  )}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">John Trader</p>
            <p className="text-xs text-slate-400">Premium Account</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
