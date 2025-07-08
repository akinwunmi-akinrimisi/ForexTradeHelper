import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AIRecommendations } from "@/components/ai-trading/ai-recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";

export default function AIInsights() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: accountTrackers, isLoading } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const activeAccounts = accountTrackers?.filter((acc: any) => acc.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="AI Trading Insights" 
        subtitle="AI-powered analysis and recommendations for your forex trading"
      />
      
      <div className="p-6 space-y-6">
        {/* Account Selection */}
        {activeAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select Account for AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedAccountId} 
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Choose an account tracker" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - ${account.currentBalance.toFixed(0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* AI Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Risk Management</h3>
                  <p className="text-sm text-muted-foreground">
                    AI calculates optimal lot sizes and risk allocation based on your trading history
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Growth Plan Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Dynamic plan adjustments based on your performance and market conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">1:3 Risk-Reward Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    All recommendations maintain minimum 1:3 risk-to-reward ratio for consistent profitability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Trading Rules */}
        <Card>
          <CardHeader>
            <CardTitle>AI Trading Engine Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Currency Pairs</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    GBPUSD - British Pound vs US Dollar
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    GBPJPY - British Pound vs Japanese Yen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    EURJPY - Euro vs Japanese Yen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    EURUSD - Euro vs US Dollar
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    USDJPY - US Dollar vs Japanese Yen
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Risk Management Rules</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Maximum 3 trades per day
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Daily risk allocation: 50%, 25%, 25%
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Minimum 1:3 risk-to-reward ratio
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Maximum 1% total daily risk
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Adaptive risk based on performance
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {selectedAccountId ? (
          <AIRecommendations accountTrackerId={parseInt(selectedAccountId)} />
        ) : activeAccounts.length > 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Select an account to view AI recommendations
              </h3>
              <p className="text-gray-500">
                Choose an account tracker above to get personalized AI trading insights and recommendations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No active accounts found
              </h3>
              <p className="text-gray-500">
                Create an account tracker to start receiving AI-powered trading recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}