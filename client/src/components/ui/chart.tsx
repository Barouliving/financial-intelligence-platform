import * as React from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Common chart container
interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Chart({ children, className, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// Line chart for time-series data
interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    name?: string;
    connectNulls?: boolean;
  }>;
  xAxis?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  className?: string;
}

export function SimpleLineChart({
  data,
  lines,
  xAxis = "name",
  grid = true,
  tooltip = true,
  legend = true,
  className,
}: LineChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Chart className={className}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        {tooltip && <Tooltip />}
        {legend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke || defaultColors[index % defaultColors.length]}
            strokeWidth={line.strokeWidth || 2}
            name={line.name || line.dataKey}
            connectNulls={line.connectNulls || false}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </Chart>
  );
}

// Area chart for cumulative or stacked data
interface AreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    fill?: string;
    stroke?: string;
    name?: string;
    stackId?: string;
  }>;
  xAxis?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  className?: string;
}

export function SimpleAreaChart({
  data,
  areas,
  xAxis = "name",
  grid = true,
  tooltip = true,
  legend = true,
  className,
}: AreaChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Chart className={className}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        {tooltip && <Tooltip />}
        {legend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            fill={area.fill || defaultColors[index % defaultColors.length]}
            stroke={area.stroke || defaultColors[index % defaultColors.length]}
            name={area.name || area.dataKey}
            stackId={area.stackId}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </Chart>
  );
}

// Bar chart for category comparisons
interface BarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    fill?: string;
    name?: string;
  }>;
  xAxis?: string;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  vertical?: boolean;
  className?: string;
}

export function SimpleBarChart({
  data,
  bars,
  xAxis = "name",
  grid = true,
  tooltip = true,
  legend = true,
  vertical = false,
  className,
}: BarChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Chart className={className}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        layout={vertical ? "vertical" : "horizontal"}
      >
        {grid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        {vertical ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis dataKey={xAxis} type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          </>
        )}
        {tooltip && <Tooltip />}
        {legend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill || defaultColors[index % defaultColors.length]}
            name={bar.name || bar.dataKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </Chart>
  );
}

// Pie chart for part-to-whole relationships
interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    fill?: string;
  }>;
  dataKey?: string;
  nameKey?: string;
  tooltip?: boolean;
  legend?: boolean;
  donut?: boolean;
  className?: string;
}

export function SimplePieChart({
  data,
  dataKey = "value",
  nameKey = "name",
  tooltip = true,
  legend = true,
  donut = false,
  className,
}: PieChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const outerRadius = 80;
  const innerRadius = donut ? 50 : 0;

  return (
    <Chart className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        {tooltip && <Tooltip />}
        {legend && <Legend />}
      </PieChart>
    </Chart>
  );
}

// Mini charts for dashboard metrics
interface MiniChartProps {
  data: number[];
  color?: string;
  className?: string;
}

export function MiniLineChart({ data, color = "hsl(var(--chart-1))", className }: MiniChartProps) {
  // Convert data to format expected by recharts
  const chartData = data.map((value, index) => ({ value }));

  return (
    <div className={cn("w-full h-10", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
