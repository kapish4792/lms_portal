"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

interface Series {
  label: string;
  color: string;
  values: number[];
}

export function LineChart({
  labels,
  series,
  height = 240,
  isLoading = false,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  isLoading?: boolean;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { chartData, chartConfig } = useMemo(() => {
    const data = labels.map((label, idx) => {
      const row: Record<string, string | number> = { label };
      series.forEach((s, sIdx) => {
        row[`series_${sIdx}`] = s.values[idx] ?? 0;
      });
      return row;
    });

    const config: ChartConfig = {};
    series.forEach((s, sIdx) => {
      config[`series_${sIdx}`] = {
        label: s.label,
        color: s.color,
      };
    });

    return { chartData: data, chartConfig: config };
  }, [labels, series]);

  if (!mounted || isLoading) {
    return (
      <div
        className="w-full rounded-xl border border-surface-border bg-surface-sunken/40 flex flex-col items-center justify-center relative overflow-hidden animate-pulse"
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-text-tertiary text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
          <span>Loading activity charts...</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-500/5 to-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {series.map((s, idx) => (
              <linearGradient key={idx} id={`line_gradient_series_${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-divider)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend content={<ChartLegendContent />} />
          {series.map((s, idx) => (
            <Area
              key={idx}
              type="monotone"
              dataKey={`series_${idx}`}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#line_gradient_series_${idx})`}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "#fff" }}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
