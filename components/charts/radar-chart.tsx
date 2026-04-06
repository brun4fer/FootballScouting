"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ChartSeries = {
  key: string;
  name: string;
  color: string;
};

export function RadarChart({
  data,
  angleKey,
  series,
  height = 360,
}: {
  data: Array<Record<string, string | number>>;
  angleKey: string;
  series: ChartSeries[];
  height?: number;
}) {
  if (!data.length) {
    return (
      <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para apresentar.
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.2)" />
          <PolarAngleAxis dataKey={angleKey} stroke="rgba(148,163,184,0.85)" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="rgba(148,163,184,0.6)" />
          <Tooltip />
          <Legend />
          {series.map((entry) => (
            <Radar
              key={entry.key}
              name={entry.name}
              dataKey={entry.key}
              stroke={entry.color}
              fill={entry.color}
              fillOpacity={0.2}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
