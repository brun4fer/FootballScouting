import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  competitions,
  metricDefinitions,
  players,
  reports,
  shadowTeams,
  type MetricDefinition,
  type Player,
  type Report,
  type ReportMetric,
  type ShadowTeam,
} from "@/db/schema";
import { DEFAULT_METRIC_DEFINITIONS } from "@/lib/default-metrics";
import { joinPositionNames, matchesPositionFilter } from "@/lib/scouting-helpers";

export type PlayerWithContext = Player & {
  clubName: string;
  countryName: string;
  positionNames: string[];
};

export type ReportMetricWithDefinition = ReportMetric &
  Pick<MetricDefinition, "name" | "category" | "displayOrder">;

export type ReportWithContext = Report & {
  playerName: string;
  playerPhoto: string | null;
  clubName: string;
  countryName: string;
  competitionName: string;
  seasonName: string;
  positionNames: string[];
};

export type ShadowTeamWithPlayers = ShadowTeam & {
  players: PlayerWithContext[];
};

async function getPositionsMap() {
  const rows = await db.query.positions.findMany({
    orderBy: (table, { asc }) => [asc(table.displayOrder), asc(table.name)],
  });

  return new Map(rows.map((row) => [row.id, row]));
}

async function getClubsMap() {
  const rows = await db.query.clubs.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return new Map(rows.map((row) => [row.id, row]));
}

async function getCountriesMap() {
  const rows = await db.query.countries.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return new Map(rows.map((row) => [row.id, row]));
}

async function getSeasonsMap() {
  const rows = await db.query.seasons.findMany({
    orderBy: (table, { desc }) => [desc(table.id)],
  });

  return new Map(rows.map((row) => [row.id, row]));
}

export async function ensureMetricDefinitions() {
  const existing = await db.query.metricDefinitions.findMany({
    orderBy: (table, { asc }) => [asc(table.category), asc(table.displayOrder), asc(table.name)],
  });

  if (existing.length > 0) {
    return existing;
  }

  await db.insert(metricDefinitions).values(DEFAULT_METRIC_DEFINITIONS).onConflictDoNothing();

  return db.query.metricDefinitions.findMany({
    orderBy: (table, { asc }) => [asc(table.category), asc(table.displayOrder), asc(table.name)],
  });
}

export async function getSeasons() {
  return db.query.seasons.findMany({
    orderBy: (table, { desc }) => [desc(table.id)],
  });
}

export async function getCompetitions() {
  const [competitionRows, seasonsMap] = await Promise.all([
    db.query.competitions.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    }),
    getSeasonsMap(),
  ]);

  return competitionRows.map((competition) => ({
    ...competition,
    seasonName: seasonsMap.get(competition.seasonId)?.name ?? "-",
  }));
}

export async function getPositions() {
  return db.query.positions.findMany({
    orderBy: (table, { asc }) => [asc(table.displayOrder), asc(table.name)],
  });
}

export async function getClubs() {
  return db.query.clubs.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getCountries() {
  return db.query.countries.findMany({
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getPlayerOptions() {
  return db.query.players.findMany({
    columns: {
      id: true,
      name: true,
    },
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getCompetitionOptions() {
  return db.query.competitions.findMany({
    columns: {
      id: true,
      name: true,
      seasonId: true,
    },
    orderBy: (table, { asc }) => [asc(table.name)],
  });
}

export async function getPositionOptions() {
  return db.query.positions.findMany({
    columns: {
      id: true,
      name: true,
    },
    orderBy: (table, { asc }) => [asc(table.displayOrder), asc(table.name)],
  });
}

export async function getPlayers(filters?: {
  positionId?: number;
  clubId?: number;
  countryId?: number;
  playerIds?: number[];
}) {
  const conditions = [];

  if (filters?.clubId) {
    conditions.push(eq(players.clubId, filters.clubId));
  }

  if (filters?.countryId) {
    conditions.push(eq(players.countryId, filters.countryId));
  }

  if (filters?.playerIds?.length) {
    conditions.push(inArray(players.id, filters.playerIds));
  }

  const [playerRows, clubsMap, countriesMap, positionsMap] = await Promise.all([
    conditions.length
      ? db.select().from(players).where(and(...conditions)).orderBy(asc(players.name))
      : db.select().from(players).orderBy(asc(players.name)),
    getClubsMap(),
    getCountriesMap(),
    getPositionsMap(),
  ]);

  return playerRows
    .filter((player) => matchesPositionFilter(player, filters?.positionId))
    .map((player) => ({
      ...player,
      clubName: clubsMap.get(player.clubId)?.name ?? "-",
      countryName: countriesMap.get(player.countryId)?.name ?? "-",
      positionNames: joinPositionNames(player, positionsMap),
    }));
}

export async function getPlayerById(id: number) {
  const [player, clubsMap, countriesMap, positionsMap] = await Promise.all([
    db.query.players.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    }),
    getClubsMap(),
    getCountriesMap(),
    getPositionsMap(),
  ]);

  if (!player) {
    return null;
  }

  return {
    ...player,
    clubName: clubsMap.get(player.clubId)?.name ?? "-",
    countryName: countriesMap.get(player.countryId)?.name ?? "-",
    positionNames: joinPositionNames(player, positionsMap),
  };
}

export async function getReports(filters?: {
  playerId?: number;
  playerIds?: number[];
  competitionId?: number;
  positionId?: number;
  shadowTeamId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: Report["status"] | "all";
}) {
  const shadowTeamPlayerIds =
    filters?.shadowTeamId
      ? (
          await db.query.shadowTeamPlayers.findMany({
            columns: {
              playerId: true,
            },
            where: (table, { eq }) => eq(table.shadowTeamId, filters.shadowTeamId as number),
          })
        ).map((entry) => entry.playerId)
      : [];

  if (filters?.shadowTeamId && shadowTeamPlayerIds.length === 0) {
    return [] as ReportWithContext[];
  }

  const conditions = [];

  if (filters?.playerId) {
    conditions.push(eq(reports.playerId, filters.playerId));
  }

  if (filters?.playerIds?.length) {
    conditions.push(inArray(reports.playerId, filters.playerIds));
  }

  if (filters?.shadowTeamId) {
    conditions.push(inArray(reports.playerId, shadowTeamPlayerIds));
  }

  if (filters?.competitionId) {
    conditions.push(eq(reports.competitionId, filters.competitionId));
  }

  if (filters?.dateFrom) {
    conditions.push(gte(reports.reportDate, filters.dateFrom));
  }

  if (filters?.dateTo) {
    conditions.push(lte(reports.reportDate, filters.dateTo));
  }

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(reports.status, filters.status));
  }

  const [reportRows, allPlayers, competitionRows, seasonsMap] = await Promise.all([
    conditions.length
      ? db.select().from(reports).where(and(...conditions)).orderBy(desc(reports.reportDate), desc(reports.id))
      : db.select().from(reports).orderBy(desc(reports.reportDate), desc(reports.id)),
    getPlayers(),
    db.query.competitions.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    }),
    getSeasonsMap(),
  ]);

  const playersMap = new Map(allPlayers.map((player) => [player.id, player]));
  const competitionsMap = new Map(competitionRows.map((competition) => [competition.id, competition]));

  return reportRows
    .filter((report) => {
      const player = playersMap.get(report.playerId);
      return player ? matchesPositionFilter(player, filters?.positionId) : false;
    })
    .map((report) => {
      const player = playersMap.get(report.playerId);
      const competition = competitionsMap.get(report.competitionId);

      return {
        ...report,
        playerName: player?.name ?? "-",
        playerPhoto: player?.photo ?? null,
        clubName: player?.clubName ?? "-",
        countryName: player?.countryName ?? "-",
        competitionName: competition?.name ?? "-",
        seasonName: competition ? seasonsMap.get(competition.seasonId)?.name ?? "-" : "-",
        positionNames: player?.positionNames ?? [],
      };
    });
}

export async function getPlayerReports(playerId: number) {
  return getReports({ playerId });
}

export async function getReportById(id: number) {
  const [report, definitions] = await Promise.all([
    db.query.reports.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    }),
    ensureMetricDefinitions(),
  ]);

  if (!report) {
    return null;
  }

  const [reportRow] = await getReports({ playerId: report.playerId }).then((rows) =>
    rows.filter((entry) => entry.id === id),
  );

  const metricsRows = await db.query.reportMetrics.findMany({
    where: (table, { eq }) => eq(table.reportId, id),
    orderBy: (table, { asc }) => [asc(table.metricId)],
  });

  const metricsMap = new Map(metricsRows.map((row) => [row.metricId, row]));

  return {
    ...reportRow,
    metrics: definitions.map((definition) => {
      const metric = metricsMap.get(definition.id);

      return {
        id: metric?.id ?? 0,
        reportId: report.id,
        metricId: definition.id,
        value: metric?.value ?? null,
        name: definition.name,
        category: definition.category,
        displayOrder: definition.displayOrder,
      };
    }),
  };
}

export async function getMetricDefinitions() {
  return ensureMetricDefinitions();
}

export async function getShadowTeams() {
  const [teamsRows, links] = await Promise.all([
    db.query.shadowTeams.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    }),
    db.query.shadowTeamPlayers.findMany(),
  ]);

  const counts = new Map<number, number>();

  for (const link of links) {
    counts.set(link.shadowTeamId, (counts.get(link.shadowTeamId) ?? 0) + 1);
  }

  return teamsRows.map((team) => ({
    ...team,
    playerCount: counts.get(team.id) ?? 0,
  }));
}

export async function getShadowTeamById(id: number) {
  const team = await db.query.shadowTeams.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });

  if (!team) {
    return null;
  }

  const links = await db.query.shadowTeamPlayers.findMany({
    where: (table, { eq }) => eq(table.shadowTeamId, id),
  });

  const playersRows = await getPlayers({
    playerIds: links.map((entry) => entry.playerId),
  });

  const playersMap = new Map(playersRows.map((player) => [player.id, player]));

  return {
    ...team,
    players: links
      .map((link) => playersMap.get(link.playerId))
      .filter((player): player is PlayerWithContext => Boolean(player)),
  } satisfies ShadowTeamWithPlayers;
}

export async function getOverviewCounts() {
  const [playerRows, reportRows, shadowTeamRows, competitionRows] = await Promise.all([
    db.select({ id: players.id }).from(players),
    db.select({ id: reports.id }).from(reports),
    db.select({ id: shadowTeams.id }).from(shadowTeams),
    db.select({ id: competitions.id }).from(competitions),
  ]);

  return {
    players: playerRows.length,
    reports: reportRows.length,
    shadowTeams: shadowTeamRows.length,
    competitions: competitionRows.length,
  };
}

export async function getReportMetricsByPlayer(playerId: number) {
  const playerReports = await db.query.reports.findMany({
    columns: {
      id: true,
      reportDate: true,
    },
    where: (table, { eq }) => eq(table.playerId, playerId),
    orderBy: (table, { asc }) => [asc(table.reportDate), asc(table.id)],
  });

  if (!playerReports.length) {
    return [] as Array<{
      reportId: number;
      reportDate: string;
      metricId: number;
      value: number | null;
      name: string;
      category: MetricDefinition["category"];
      displayOrder: number;
    }>;
  }

  const definitions = await ensureMetricDefinitions();
  const metricsRows = await db.query.reportMetrics.findMany({
    where: (table, { inArray }) => inArray(table.reportId, playerReports.map((report) => report.id)),
  });

  const reportMap = new Map(playerReports.map((report) => [report.id, report]));
  const definitionMap = new Map(definitions.map((definition) => [definition.id, definition]));

  return metricsRows
    .map((metric) => {
      const report = reportMap.get(metric.reportId);
      const definition = definitionMap.get(metric.metricId);
      if (!report || !definition) {
        return null;
      }

      return {
        reportId: report.id,
        reportDate: report.reportDate,
        metricId: metric.metricId,
        value: metric.value,
        name: definition.name,
        category: definition.category,
        displayOrder: definition.displayOrder,
      };
    })
    .filter(
      (
        metric,
      ): metric is {
        reportId: number;
        reportDate: string;
        metricId: number;
        value: number | null;
        name: string;
        category: MetricDefinition["category"];
        displayOrder: number;
      } => Boolean(metric),
    );
}
