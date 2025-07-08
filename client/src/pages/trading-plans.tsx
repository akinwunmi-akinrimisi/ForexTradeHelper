import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GrowthPlanOverview } from "@/components/growth-plan/growth-plan-overview";
import { Target, TrendingUp, BarChart3, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

export default function TradingPlans() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const { data: accountTrackers, isLoading: loadingAccounts } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const { data: tradingPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ["/api/trading-plans"],
  });

  if (loadingAccounts || loadingPlans) {
    return (
      <div className="space-y-6">
        <Header 
          title="Trading Plans" 
          subtitle="Manage your trading strategies and growth plans"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Trading Plans" 
        subtitle="Manage your trading strategies and growth plans"
      />
      
      {/* Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Account
          </CardTitle>
          <CardDescription>
            Choose an account to view its trading plan and growth strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedAccountId?.toString() || ""} 
            onValueChange={(value) => setSelectedAccountId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an account tracker" />
            </SelectTrigger>
            <SelectContent>
              {accountTrackers?.map((account: any) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name} - ${account.currentBalance.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Trading Plan Overview */}
      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trading Plan Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const plan = tradingPlans?.find((p: any) => p.accountTrackerId === selectedAccountId);
              if (!plan) {
                return <p className="text-gray-500">No trading plan found for this account.</p>;
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Recommended Lot Size</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900">{plan.recommendedLotSize}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Risk Percentage</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">{plan.riskPercentage}%</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Risk:Reward Ratio</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900">
                      1:{(plan.takeProfitPips / plan.stopLossPips).toFixed(1)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Growth Plan */}
      {selectedAccountId && (
        <GrowthPlanOverview accountTrackerId={selectedAccountId} />
      )}

      {/* Risk Management Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Management Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Daily Limits
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="destructive" className="text-xs">!</Badge>
                  <span>Maximum 3 trades per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="destructive" className="text-xs">!</Badge>
                  <span>1% daily capital risk limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="destructive" className="text-xs">!</Badge>
                  <span>Risk allocation: 50%, 25%, 25%</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Best Practices
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Focus on GBPUSD, GBPJPY, EURJPY, EURUSD, USDJPY</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Maintain 1:2 risk-reward ratio minimum</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Update trade results immediately</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>How Enhanced Trading Plans Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <div>
              <h4 className="font-medium">Intelligent Growth Planning</h4>
              <p className="text-sm text-gray-600">
                System calculates 10-15 trades needed to reach your profit target with conservative risk management.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <div>
              <h4 className="font-medium">Dynamic Daily Plans</h4>
              <p className="text-sm text-gray-600">
                Each day gets specific trade plans with currency pairs, lot sizes, and risk allocations.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <div>
              <h4 className="font-medium">Adaptive Risk Management</h4>
              <p className="text-sm text-gray-600">
                Plans adapt based on actual trade results to preserve capital and stay on target.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <div>
              <h4 className="font-medium">Currency Pair Flexibility</h4>
              <p className="text-sm text-gray-600">
                Toggle between different currency pairs and generate specific trade plans for your preferred pairs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
