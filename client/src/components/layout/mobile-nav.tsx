import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  PlusCircle
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Trades', href: '/trades', icon: PlusCircle },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Analytics', href: '/performance', icon: TrendingUp },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex flex-col items-center py-2 px-3 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
