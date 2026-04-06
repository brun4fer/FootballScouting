import type { ReportWithContext } from "@/lib/scouting-data";
import { average, roundToOne } from "@/lib/scouting-helpers";

export type PlayerSummary = {
  playerId: number;
  playerName: string;
  clubName: string;
  positionNames: string[];
  reportCount: number;
  offensiveAverage: number;
  defensiveAverage: number;
  physicalAverage: number;
  psychologicalAverage: number;
  overallAverage: number;
  lastReportDate: string | null;
};

export function aggregatePlayerSummaries(rows: ReportWithContext[]) {
  const grouped = new Map<number, ReportWithContext[]>();

  for (const row of rows) {
    const reportList = grouped.get(row.playerId) ?? [];
    reportList.push(row);
    grouped.set(row.playerId, reportList);
  }

  return Array.from(grouped.entries())
    .map(([playerId, playerRows]) => {
      const firstRow = playerRows[0];

      return {
        playerId,
        playerName: firstRow.playerName,
        clubName: firstRow.clubName,
        positionNames: firstRow.positionNames,
        reportCount: playerRows.length,
        offensiveAverage: roundToOne(average(playerRows.map((row) => Number(row.offensiveAverage ?? 0)))),
        defensiveAverage: roundToOne(average(playerRows.map((row) => Number(row.defensiveAverage ?? 0)))),
        physicalAverage: roundToOne(average(playerRows.map((row) => Number(row.physicalAverage ?? 0)))),
        psychologicalAverage: roundToOne(
          average(playerRows.map((row) => Number(row.psychologicalAverage ?? 0))),
        ),
        overallAverage: roundToOne(average(playerRows.map((row) => Number(row.overallAverage ?? 0)))),
        lastReportDate:
          playerRows
            .map((row) => row.reportDate)
            .sort((left, right) => right.localeCompare(left))[0] ?? null,
      } satisfies PlayerSummary;
    })
    .sort((left, right) => right.overallAverage - left.overallAverage || left.playerName.localeCompare(right.playerName));
}

export function buildOverviewCards(rows: ReportWithContext[]) {
  const playerSummaries = aggregatePlayerSummaries(rows);

  return {
    players: playerSummaries.length,
    reports: rows.length,
    averageOverall: roundToOne(average(rows.map((row) => Number(row.overallAverage ?? 0)))),
    topPlayer: playerSummaries[0]?.playerName ?? "-",
  };
}

export function buildEvolutionSeries(rows: ReportWithContext[]) {
  return [...rows]
    .sort((left, right) => left.reportDate.localeCompare(right.reportDate))
    .map((row) => ({
      label: row.reportDate,
      overallAverage: roundToOne(Number(row.overallAverage ?? 0)),
      offensiveAverage: roundToOne(Number(row.offensiveAverage ?? 0)),
      defensiveAverage: roundToOne(Number(row.defensiveAverage ?? 0)),
      physicalAverage: roundToOne(Number(row.physicalAverage ?? 0)),
      psychologicalAverage: roundToOne(Number(row.psychologicalAverage ?? 0)),
    }));
}

export function buildComparisonRows(rows: ReportWithContext[]) {
  return aggregatePlayerSummaries(rows).map((summary) => ({
    label: summary.playerName,
    overallAverage: summary.overallAverage,
    offensiveAverage: summary.offensiveAverage,
    defensiveAverage: summary.defensiveAverage,
    physicalAverage: summary.physicalAverage,
    psychologicalAverage: summary.psychologicalAverage,
  }));
}

export function buildRadarData(summary: Pick<
  PlayerSummary,
  "offensiveAverage" | "defensiveAverage" | "physicalAverage" | "psychologicalAverage"
>) {
  return [
    { metric: "Ofensivo", value: summary.offensiveAverage },
    { metric: "Defensivo", value: summary.defensiveAverage },
    { metric: "Fisico", value: summary.physicalAverage },
    { metric: "Psicologico", value: summary.psychologicalAverage },
  ];
}

export function buildComparisonRadarData(rows: ReturnType<typeof buildComparisonRows>) {
  const categories = [
    { key: "offensiveAverage", label: "Ofensivo" },
    { key: "defensiveAverage", label: "Defensivo" },
    { key: "physicalAverage", label: "Fisico" },
    { key: "psychologicalAverage", label: "Psicologico" },
  ] as const;

  return categories.map((category) => {
    const base: Record<string, string | number> = {
      metric: category.label,
    };

    for (const row of rows) {
      base[row.label] = Number(row[category.key]);
    }

    return base;
  });
}

export function buildMetricFocusRows(
  metrics: Array<{ name: string; value: number | null; category: string }>,
) {
  return metrics
    .filter((metric) => typeof metric.value === "number")
    .map((metric) => ({
      label: metric.name,
      value: Number(metric.value ?? 0),
      category: metric.category,
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}
