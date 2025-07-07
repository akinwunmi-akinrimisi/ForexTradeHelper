import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { ClipboardList, Target, TrendingUp, Shield, Calendar } from "lucide-react";

export default function TradingPlans() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const { data: accountTrackers } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const { data: tradingPlan } = useQuery({
    queryKey: ["/api/trading-plans", selectedAccount],
    enabled: !!selectedAccount,
  });

  const firstAccountId = accountTrackers?.[0]?.id;
  const currentAccountId = selectedAccount || firstAccountId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Trading Plans" 
        subtitle="View and manage your automated trading plans"
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

        {tradingPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Plan Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Current Trading Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Lot Size</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900">
                      {tradingPlan.recommendedLotSize}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Max Positions</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">
                      {tradingPlan.maxOpenPositions}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Stop Loss</span>
                    </div>
                    <p className="text-xl font-bold text-red-900">
                      {tradingPlan.stopLossPips} pips
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Take Profit</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900">
                      {tradingPlan.takeProfitPips} pips
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Risk per Trade</span>
                    <Badge variant="outline">{tradingPlan.riskPercentage}%</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-600">Suggested Trades/Week</span>
                    <Badge variant="outline">{tradingPlan.suggestedTradesPerWeek}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-600">Risk:Reward Ratio</span>
                    <Badge variant="outline">
                      1:{(tradingPlan.takeProfitPips / tradingPlan.stopLossPips).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Strategy Type</h4>
                  <p className="text-sm text-gray-600">
                    Conservative risk management with moderate growth targets. This plan automatically adjusts based on your account performance.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Management</h4>
                  <p className="text-sm text-gray-600">
                    • Maximum {tradingPlan.riskPercentage}% risk per trade
                    • Stop loss at {tradingPlan.stopLossPips} pips
                    • Take profit at {tradingPlan.takeProfitPips} pips
                    • Maximum {tradingPlan.maxOpenPositions} concurrent positions
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Plan Updates</h4>
                  <p className="text-sm text-gray-600">
                    This plan automatically recalculates after each trade based on your current account balance and performance metrics.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(tradingPlan.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!currentAccountId && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No account trackers available. Create an account tracker to view trading plans.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
