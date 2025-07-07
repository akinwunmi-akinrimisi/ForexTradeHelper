import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/ui/metric-card";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: accountTrackers, isLoading: loadingAccounts } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const { data: trades, isLoading: loadingTrades } = useQuery({
    queryKey: ["/api/trades"],
  });

  // Calculate metrics
  const totalTrades = trades?.length || 0;
  const winningTrades = trades?.filter((t: any) => t.outcome === 'win').length || 0;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades?.reduce((sum: number, trade: any) => sum + trade.profitLoss, 0) || 0;
  const totalBalance = accountTrackers?.reduce((sum: number, acc: any) => sum + acc.currentBalance, 0) || 0;

  // Recent trades for display
  const recentTrades = trades?.slice(-5) || [];

  // Performance chart data
  const performanceData = [0, 450, 320, 680, 1200, totalPnL];
  const performanceLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total P&L"
          value={`$${totalPnL.toFixed(2)}`}
          change={totalPnL >= 0 ? `+${Math.abs(totalPnL / 100).toFixed(1)}%` : `-${Math.abs(totalPnL / 100).toFixed(1)}%`}
          changeType={totalPnL >= 0 ? "positive" : "negative"}
          description="vs last month"
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
        />

        <MetricCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          change="+2.1%"
          changeType="positive"
          description="vs last month"
          icon={<Percent className="h-6 w-6 text-blue-600" />}
        />

        <MetricCard
          title="Active Accounts"
          value={accountTrackers?.length?.toString() || "0"}
          description={`Total balance: $${totalBalance.toFixed(0)}`}
          icon={<Wallet className="h-6 w-6 text-orange-600" />}
        />

        <MetricCard
          title="Monthly Trades"
          value={totalTrades.toString()}
          description="Avg per week: 10.5"
          icon={<TrendingUp className="h-6 w-6 text-gray-600" />}
        />
      </div>

      {/* Chart and Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Overview</CardTitle>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PerformanceChart data={performanceData} labels={performanceLabels} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Trades</CardTitle>
              <Link href="/trades">
                <a className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</a>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.length > 0 ? (
                recentTrades.map((trade: any) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trade.outcome === 'win' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.outcome === 'win' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{trade.currencyPair}</p>
                        <p className="text-sm text-gray-500">{trade.lotSize} lots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(trade.tradeDateTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No trades yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Trackers Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Trackers</CardTitle>
            <Link href="/accounts">
              <Button size="sm">Create New</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accountTrackers?.length > 0 ? (
              accountTrackers.map((account: any) => {
                const progressPercent = Math.min(100, (account.currentBalance / (account.startingCapital * (1 + account.profitTarget / 100))) * 100);
                const isProfit = account.currentBalance > account.startingCapital;
                
                return (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{account.name}</h4>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Starting Capital:</span>
                        <span className="font-medium">${account.startingCapital.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Balance:</span>
                        <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          ${account.currentBalance.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Target:</span>
                        <span className="font-medium">
                          ${(account.startingCapital * (1 + account.profitTarget / 100)).toFixed(0)} ({account.profitTarget}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div 
                          className={`h-2 rounded-full ${isProfit ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isProfit ? `${((account.currentBalance / account.startingCapital - 1) * 100).toFixed(1)}% profit` : `${((1 - account.currentBalance / account.startingCapital) * 100).toFixed(1)}% loss`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <p>No account trackers yet</p>
                <Link href="/accounts">
                  <Button className="mt-2">Create Your First Account</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
