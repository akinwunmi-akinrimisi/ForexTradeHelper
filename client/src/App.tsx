import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useWebSocket } from "@/hooks/use-websocket";
import Dashboard from "@/pages/dashboard";
import Trades from "@/pages/trades";
import Accounts from "@/pages/accounts";
import Performance from "@/pages/performance";
import TradingPlans from "@/pages/trading-plans";
import NotFound from "@/pages/not-found";

function AppContent() {
  useWebSocket(); // Initialize WebSocket connection

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/trades" component={Trades} />
          <Route path="/accounts" component={Accounts} />
          <Route path="/performance" component={Performance} />
          <Route path="/trading-plans" component={TradingPlans} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
