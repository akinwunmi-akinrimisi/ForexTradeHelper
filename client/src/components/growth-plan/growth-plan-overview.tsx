import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CURRENCY_PAIRS } from "@/lib/constants";
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3 
} from "lucide-react";

interface GrowthPlanOverviewProps {
  accountTrackerId: number;
}

export function GrowthPlanOverview({ accountTrackerId }: GrowthPlanOverviewProps) {
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: growthPlan, isLoading: loadingGrowthPlan } = useQuery({
    queryKey: ["/api/growth-plans", accountTrackerId],
    enabled: !!accountTrackerId,
  });

  const { data: dailyTradePlans, isLoading: loadingDailyPlans } = useQuery({
    queryKey: ["/api/daily-trade-plans", growthPlan?.id, selectedDate],
    enabled: !!growthPlan?.id,
  });

  const { data: accountTracker } = useQuery({
    queryKey: ["/api/account-trackers"],
  });

  const currentAccount = accountTracker?.find((acc: any) => acc.id === accountTrackerId);

  const updateTradePlanMutation = useMutation({
    mutationFn: async ({ planId, actualResult }: { planId: number; actualResult: number }) => {
      const response = await apiRequest("PATCH", `/api/daily-trade-plans/${planId}`, {
        actualResult,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trade result updated",
        description: "Growth plan has been recalculated based on your trade result.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/growth-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-trade-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/account-trackers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating trade result",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generatePlansForPairMutation = useMutation({
    mutationFn: async ({ currencyPair, date }: { currencyPair: string; date: string }) => {
      const response = await apiRequest("POST", `/api/daily-trade-plans/generate/${growthPlan?.id}`, {
        currencyPair,
        date,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plans generated",
        description: `New trading plans generated for ${selectedPair}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-trade-plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating plans",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTradeResultUpdate = (planId: number, actualResult: number) => {
    updateTradePlanMutation.mutate({ planId, actualResult });
  };

  const handleGenerateForPair = () => {
    if (selectedPair && growthPlan) {
      generatePlansForPairMutation.mutate({
        currencyPair: selectedPair,
        date: selectedDate,
      });
    }
  };

  if (loadingGrowthPlan || !growthPlan) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Loading growth plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (growthPlan.totalTradesCompleted / growthPlan.targetTrades) * 100;
  const remainingTrades = growthPlan.targetTrades - growthPlan.totalTradesCompleted;
  const dailyRiskRemaining = growthPlan.dailyRiskLimit - growthPlan.dailyLossUsed;

  return (
    <div className="space-y-6">
      {/* Growth Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Growth Plan Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Target Trades</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{growthPlan.targetTrades}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Completed</span>
              </div>
              <p className="text-xl font-bold text-green-900">{growthPlan.totalTradesCompleted}</p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Remaining Days</span>
              </div>
              <p className="text-xl font-bold text-orange-900">{growthPlan.remainingDays}</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Daily Risk Limit</span>
              </div>
              <p className="text-xl font-bold text-purple-900">${growthPlan.dailyRiskLimit.toFixed(0)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Target</span>
              <span>{growthPlan.totalTradesCompleted}/{growthPlan.targetTrades} trades</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {remainingTrades} trades remaining • ${dailyRiskRemaining.toFixed(2)} daily risk available
            </p>
          </div>

          {currentAccount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Target Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Balance:</span>
                  <p className="font-medium">${currentAccount.currentBalance.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Target Amount:</span>
                  <p className="font-medium">
                    ${(currentAccount.startingCapital * (1 + currentAccount.profitTarget / 100)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Profit Needed:</span>
                  <p className="font-medium">
                    ${Math.max(0, (currentAccount.startingCapital * (1 + currentAccount.profitTarget / 100)) - currentAccount.currentBalance).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Target Progress:</span>
                  <p className="font-medium">
                    {Math.min(100, ((currentAccount.currentBalance / (currentAccount.startingCapital * (1 + currentAccount.profitTarget / 100))) * 100)).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Pair Selection and Daily Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Trading Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Pair
              </label>
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency pair" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_PAIRS.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateForPair}
                disabled={!selectedPair || generatePlansForPairMutation.isPending}
              >
                {generatePlansForPairMutation.isPending ? "Generating..." : "Generate Plans"}
              </Button>
            </div>
          </div>

          {dailyTradePlans && dailyTradePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyTradePlans.map((plan: any, index: number) => (
                <Card key={plan.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Trade {plan.tradeNumber} - {plan.currencyPair}
                      </CardTitle>
                      <Badge variant={plan.isExecuted ? "default" : "secondary"}>
                        {plan.isExecuted ? "Executed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Risk Allocation:</span>
                        <p className="font-medium">{plan.allocatedRisk.toFixed(0)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Lot Size:</span>
                        <p className="font-medium">{plan.lotSize}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Stop Loss:</span>
                        <p className="font-medium">{plan.stopLossPips} pips</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Take Profit:</span>
                        <p className="font-medium">{plan.takeProfitPips} pips</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-gray-500">Expected Profit:</span>
                        <span className="font-medium text-green-600">
                          +${plan.expectedProfit.toFixed(2)}
                        </span>
                      </div>
                      
                      {!plan.isExecuted ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Actual result ($)"
                            className="h-8"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(value)) {
                                  handleTradeResultUpdate(plan.id, value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500">
                            Press Enter to submit result
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Badge variant={plan.actualResult >= 0 ? "default" : "destructive"}>
                            {plan.actualResult >= 0 ? '+' : ''}${plan.actualResult?.toFixed(2)}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Executed: {new Date(plan.executedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No trading plans for selected date and currency pair.</p>
              <p className="text-sm mt-1">Generate plans using the controls above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Management Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Management Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Daily Loss Used</h4>
              <p className="text-2xl font-bold text-yellow-900">
                ${growthPlan.dailyLossUsed.toFixed(2)}
              </p>
              <p className="text-sm text-yellow-700">
                of ${growthPlan.dailyRiskLimit.toFixed(2)} limit
              </p>
              <div className="mt-2">
                <Progress 
                  value={(growthPlan.dailyLossUsed / growthPlan.dailyRiskLimit) * 100} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Current Trade</h4>
              <p className="text-2xl font-bold text-blue-900">
                {growthPlan.currentTrade}/3
              </p>
              <p className="text-sm text-blue-700">
                trades today
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Plan Status</h4>
              <p className="text-lg font-bold text-green-900">
                {growthPlan.isCompleted ? "Completed" : "Active"}
              </p>
              <p className="text-sm text-green-700">
                {growthPlan.isCompleted ? "Target achieved!" : "In progress"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}