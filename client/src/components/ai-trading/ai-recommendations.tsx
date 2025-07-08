import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, AlertCircle, Brain } from "lucide-react";

interface AIRecommendation {
  currencyPair: string;
  lotSize: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: number;
  stopLossDistance: number;
  takeProfitDistance: number;
  confidence: number;
}

interface AIAnalysis {
  currentProgress: number;
  daysToTarget: number;
  requiredDailyReturn: number;
  optimalRiskPerTrade: number;
  recommendedTrades: AIRecommendation[];
  adjustmentReason: string;
}

interface AIRecommendationsProps {
  accountTrackerId: number;
}

export function AIRecommendations({ accountTrackerId }: AIRecommendationsProps) {
  const { data: aiAnalysis, isLoading, error } = useQuery<AIAnalysis>({
    queryKey: ['/api/ai-recommendations', accountTrackerId],
    enabled: !!accountTrackerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Trading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading AI analysis...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !aiAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Trading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Failed to load AI analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Growth Plan Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Target Progress</span>
              <span>{aiAnalysis.currentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={aiAnalysis.currentProgress} className="w-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {aiAnalysis.daysToTarget}
              </div>
              <div className="text-sm text-muted-foreground">Days to Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {aiAnalysis.requiredDailyReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Required Daily Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {aiAnalysis.optimalRiskPerTrade.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Optimal Risk per Trade</div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm">AI Insight</div>
                <div className="text-sm text-muted-foreground">
                  {aiAnalysis.adjustmentReason}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's AI Trading Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysis.recommendedTrades.map((trade, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{trade.currencyPair}</h3>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      Trade {index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getConfidenceColor(trade.confidence)}`} />
                    <span className="text-sm text-muted-foreground">
                      {getConfidenceText(trade.confidence)} Confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Lot Size</div>
                    <div className="font-medium">{trade.lotSize.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk Amount</div>
                    <div className="font-medium text-red-600">
                      ${trade.riskAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Potential Profit</div>
                    <div className="font-medium text-green-600">
                      ${trade.potentialProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk:Reward</div>
                    <div className="font-medium">1:{trade.riskRewardRatio.toFixed(1)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>Stop Loss: {trade.stopLossDistance} pips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Take Profit: {trade.takeProfitDistance} pips</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}