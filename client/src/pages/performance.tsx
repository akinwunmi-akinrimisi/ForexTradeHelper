import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/ui/metric-card";
import { CurrencyPairChart } from "@/components/charts/currency-pair-chart";
import { Header } from "@/components/layout/header";
import { TrendingUp, TrendingDown, Trophy, Target, AlertTriangle, Info } from "lucide-react";

export default function Performance() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const { data: accountTrackers } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const { data: performanceData } = useQuery({
    queryKey: ["/api/performance", selectedAccount],
    enabled: !!selectedAccount,
  });

  const firstAccountId = accountTrackers?.[0]?.id;
  const currentAccountId = selectedAccount || firstAccountId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Performance Analysis" 
        subtitle="Detailed insights and recommendations"
      />
      <div className="p-6 space-y-6">
        {/* Account Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select account tracker" />
              </SelectTrigger>
              <SelectContent>
                {accountTrackers?.map((account: any) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {performanceData && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Trades"
                value={performanceData.totalTrades.toString()}
                icon={<Target className="h-6 w-6 text-blue-600" />}
              />
              
              <MetricCard
                title="Win Rate"
                value={`${performanceData.winRate.toFixed(1)}%`}
                icon={<Trophy className="h-6 w-6 text-green-600" />}
              />
              
              <MetricCard
                title="Avg Win"
                value={`$${performanceData.avgWin.toFixed(2)}`}
                icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              />
              
              <MetricCard
                title="Avg Loss"
                value={`$${performanceData.avgLoss.toFixed(2)}`}
                icon={<TrendingDown className="h-6 w-6 text-red-600" />}
              />
            </div>

            {/* Currency Pair Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Profit/Loss by Currency Pair</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <CurrencyPairChart data={performanceData.pairPerformance} />
                </div>
              </CardContent>
            </Card>

            {/* Insights and Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.winRate > 70 && (
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-green-800">Excellent Win Rate</p>
                        <p className="text-sm text-green-700">
                          Your win rate of {performanceData.winRate.toFixed(1)}% is excellent. Consider maintaining your current strategy.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {performanceData.avgLoss > performanceData.avgWin && (
                    <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <p className="font-medium text-orange-800">Risk Management Alert</p>
                        <p className="text-sm text-orange-700">
                          Your average loss (${performanceData.avgLoss.toFixed(2)}) exceeds your average win (${performanceData.avgWin.toFixed(2)}). Consider tightening stop losses.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-blue-800">Trading Frequency</p>
                      <p className="text-sm text-blue-700">
                        You have completed {performanceData.totalTrades} trades. Maintain consistent trading frequency for better results.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!currentAccountId && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No account trackers available. Create an account tracker to view performance data.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
