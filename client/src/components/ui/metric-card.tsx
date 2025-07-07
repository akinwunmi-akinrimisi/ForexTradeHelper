import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-opacity-10">
            {icon}
          </div>
        </div>
        {(change || description) && (
          <div className="mt-4 flex items-center text-sm">
            {change && (
              <>
                <span className={cn(
                  "font-medium",
                  changeType === 'positive' && "text-green-600",
                  changeType === 'negative' && "text-red-600",
                  changeType === 'neutral' && "text-gray-500"
                )}>
                  {change}
                </span>
                {description && (
                  <span className="text-gray-500 ml-1">{description}</span>
                )}
              </>
            )}
            {!change && description && (
              <span className="text-gray-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
