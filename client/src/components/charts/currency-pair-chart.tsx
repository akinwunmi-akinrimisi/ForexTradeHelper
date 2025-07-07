import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface CurrencyPairChartProps {
  data: Record<string, number>;
  className?: string;
}

export function CurrencyPairChart({ data, className }: CurrencyPairChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = Object.keys(data);
    const values = Object.values(data);

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "P&L",
            data: values,
            backgroundColor: values.map((value) =>
              value >= 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} className={className} />;
}
