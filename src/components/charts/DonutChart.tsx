"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

interface Slice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 140,
  isLoading = false,
}: {
  data: Slice[];
  size?: number;
  isLoading?: boolean;
}) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0) || 1, [data]);

  const { chartConfig, chartData } = useMemo(() => {
    const config: ChartConfig = {};
    const formatted = data.map((d, i) => {
      const key = `slice_${i}`;
      config[key] = {
        label: d.label,
        color: d.color,
      };
      return {
        name: d.label,
        value: d.value,
        fill: d.color,
        key,
      };
    });
    return { chartConfig: config, chartData: formatted };
  }, [data]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center gap-5 p-2 animate-pulse">
        <div
          className="rounded-full border border-surface-border bg-surface-sunken/60 flex items-center justify-center shrink-0"
          style={{ width: size, height: size }}
        >
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-surface-sunken rounded" />
          <div className="h-3 w-16 bg-surface-sunken rounded" />
        </div>
      </div>
    );
  }

  const innerRadius = Math.round(size * 0.28);
  const outerRadius = Math.round(size * 0.44);

  return (
    <div className="flex items-center gap-5 w-full justify-center">
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Center Total Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-text-primary tracking-tight">{total.toLocaleString()}</span>
          <span className="text-[10px] text-text-tertiary uppercase tracking-wider scale-90">Total</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-text-secondary truncate">{d.label}</span>
            </div>
            <span className="font-semibold text-text-primary tabular-nums shrink-0">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
