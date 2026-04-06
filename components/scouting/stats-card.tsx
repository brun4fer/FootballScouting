import { StatCard } from "@/components/stats/stat-card";

export function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return <StatCard title={title} value={value} description={description} />;
}
