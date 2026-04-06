import type { MetricDefinition, Player, Position, Report } from "@/db/schema";

export const metricCategoryLabels = {
  offensive: "Ofensivo",
  defensive: "Defensivo",
  physical: "Fisico",
  psychological: "Psicologico",
} as const;

export const reportStatusLabels = {
  draft: "Rascunho",
  published: "Publicado",
} as const;

export type MetricCategory = keyof typeof metricCategoryLabels;
export type ReportStatus = keyof typeof reportStatusLabels;

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatAverage(value: number | null | undefined) {
  const parsed = Number(value ?? 0);
  return roundToOne(Number.isFinite(parsed) ? parsed : 0).toFixed(1);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatMetricCategory(category: MetricCategory) {
  return metricCategoryLabels[category];
}

export function formatReportStatus(status: ReportStatus) {
  return reportStatusLabels[status];
}

export function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function buildMetricInputName(metricId: number) {
  return `metric_${metricId}`;
}

export function calculateReportAverages(
  definitions: Pick<MetricDefinition, "id" | "category">[],
  values: Array<{ metricId: number; value: number | null }>,
) {
  const grouped = {
    offensive: [] as number[],
    defensive: [] as number[],
    physical: [] as number[],
    psychological: [] as number[],
  };
  const valuesByMetricId = new Map(values.map((entry) => [entry.metricId, entry.value]));

  for (const definition of definitions) {
    const value = valuesByMetricId.get(definition.id);
    if (typeof value === "number") {
      grouped[definition.category].push(value);
    }
  }

  return {
    offensiveAverage: roundToOne(average(grouped.offensive)),
    defensiveAverage: roundToOne(average(grouped.defensive)),
    physicalAverage: roundToOne(average(grouped.physical)),
    psychologicalAverage: roundToOne(average(grouped.psychological)),
    overallAverage: roundToOne(
      average([
        ...grouped.offensive,
        ...grouped.defensive,
        ...grouped.physical,
        ...grouped.psychological,
      ]),
    ),
  };
}

export function parseSearchId(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

export function parseSearchIds(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((entry) => entry.split(","))
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry) && entry > 0)
    .map((entry) => Math.floor(entry));
}

export function parseSearchDate(value: string | string[] | undefined) {
  if (!value || Array.isArray(value) || !isValidDateString(value)) {
    return undefined;
  }

  return value;
}

export function joinPositionNames(
  player: Pick<Player, "position1Id" | "position2Id" | "position3Id">,
  positionsMap: Map<number, Pick<Position, "id" | "name">>,
) {
  return [player.position1Id, player.position2Id, player.position3Id]
    .map((positionId) => (positionId ? positionsMap.get(positionId)?.name : null))
    .filter((position): position is string => Boolean(position));
}

export function matchesPositionFilter(
  player: Pick<Player, "position1Id" | "position2Id" | "position3Id">,
  positionId?: number,
) {
  if (!positionId) {
    return true;
  }

  return [player.position1Id, player.position2Id, player.position3Id].includes(positionId);
}

export function buildReportLabel(report: Pick<Report, "reportDate">, competitionName: string) {
  return `${formatDate(report.reportDate)} - ${competitionName}`;
}
