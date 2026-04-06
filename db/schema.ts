import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const metricCategoryEnum = pgEnum("metric_category", [
  "offensive",
  "defensive",
  "physical",
  "psychological",
]);

export const reportStatusEnum = pgEnum("report_status", ["draft", "published"]);

export const seasons = pgTable(
  "seasons",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("seasons_name_unique").on(table.name),
  }),
);

export const competitions = pgTable(
  "competitions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    seasonIdx: index("competitions_season_id_idx").on(table.seasonId),
    nameSeasonUnique: uniqueIndex("competitions_name_season_unique").on(
      table.name,
      table.seasonId,
    ),
  }),
);

export const positions = pgTable(
  "positions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("positions_name_unique").on(table.name),
    orderIdx: index("positions_display_order_idx").on(table.displayOrder),
  }),
);

export const clubs = pgTable(
  "clubs",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("clubs_name_unique").on(table.name),
  }),
);

export const countries = pgTable(
  "countries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("countries_name_unique").on(table.name),
  }),
);

export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    photo: text("photo"),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "restrict" }),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "restrict" }),
    height: integer("height"),
    weight: integer("weight"),
    agent: varchar("agent", { length: 160 }),
    position1Id: integer("position1_id")
      .notNull()
      .references(() => positions.id, { onDelete: "restrict" }),
    position2Id: integer("position2_id").references(() => positions.id, {
      onDelete: "set null",
    }),
    position3Id: integer("position3_id").references(() => positions.id, {
      onDelete: "set null",
    }),
    goals: integer("goals").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameIdx: index("players_name_idx").on(table.name),
    clubIdx: index("players_club_id_idx").on(table.clubId),
    countryIdx: index("players_country_id_idx").on(table.countryId),
    position1Idx: index("players_position1_id_idx").on(table.position1Id),
  }),
);

export const metricDefinitions = pgTable(
  "metric_definitions",
  {
    id: serial("id").primaryKey(),
    category: metricCategoryEnum("category").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    categoryIdx: index("metric_definitions_category_idx").on(table.category),
    categoryOrderIdx: index("metric_definitions_category_order_idx").on(
      table.category,
      table.displayOrder,
    ),
    metricUnique: uniqueIndex("metric_definitions_category_name_unique").on(
      table.category,
      table.name,
    ),
  }),
);

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "restrict" }),
    reportDate: date("report_date", { mode: "string" }).notNull(),
    observations: text("observations"),
    status: reportStatusEnum("status").notNull().default("draft"),
    offensiveAverage: real("offensive_average").notNull().default(0),
    defensiveAverage: real("defensive_average").notNull().default(0),
    physicalAverage: real("physical_average").notNull().default(0),
    psychologicalAverage: real("psychological_average").notNull().default(0),
    overallAverage: real("overall_average").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    playerIdx: index("reports_player_id_idx").on(table.playerId),
    competitionIdx: index("reports_competition_id_idx").on(table.competitionId),
    dateIdx: index("reports_report_date_idx").on(table.reportDate),
    statusIdx: index("reports_status_idx").on(table.status),
  }),
);

export const reportMetrics = pgTable(
  "report_metrics",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    metricId: integer("metric_id")
      .notNull()
      .references(() => metricDefinitions.id, { onDelete: "cascade" }),
    value: integer("value"),
  },
  (table) => ({
    reportIdx: index("report_metrics_report_id_idx").on(table.reportId),
    metricIdx: index("report_metrics_metric_id_idx").on(table.metricId),
    reportMetricUnique: uniqueIndex("report_metrics_report_metric_unique").on(
      table.reportId,
      table.metricId,
    ),
  }),
);

export const shadowTeams = pgTable(
  "shadow_teams",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 140 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("shadow_teams_name_unique").on(table.name),
  }),
);

export const shadowTeamPlayers = pgTable(
  "shadow_team_players",
  {
    id: serial("id").primaryKey(),
    shadowTeamId: integer("shadow_team_id")
      .notNull()
      .references(() => shadowTeams.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    shadowTeamIdx: index("shadow_team_players_shadow_team_id_idx").on(table.shadowTeamId),
    playerIdx: index("shadow_team_players_player_id_idx").on(table.playerId),
    uniquePlayerPerShadowTeam: uniqueIndex("shadow_team_players_unique").on(
      table.shadowTeamId,
      table.playerId,
    ),
  }),
);

export const seasonsRelations = relations(seasons, ({ many }) => ({
  competitions: many(competitions),
}));

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  season: one(seasons, {
    fields: [competitions.seasonId],
    references: [seasons.id],
  }),
  reports: many(reports),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  players: many(players),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  players: many(players),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  primaryPlayers: many(players, { relationName: "player_position1" }),
  secondaryPlayers: many(players, { relationName: "player_position2" }),
  tertiaryPlayers: many(players, { relationName: "player_position3" }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  club: one(clubs, {
    fields: [players.clubId],
    references: [clubs.id],
  }),
  country: one(countries, {
    fields: [players.countryId],
    references: [countries.id],
  }),
  position1: one(positions, {
    relationName: "player_position1",
    fields: [players.position1Id],
    references: [positions.id],
  }),
  position2: one(positions, {
    relationName: "player_position2",
    fields: [players.position2Id],
    references: [positions.id],
  }),
  position3: one(positions, {
    relationName: "player_position3",
    fields: [players.position3Id],
    references: [positions.id],
  }),
  reports: many(reports),
  shadowTeamPlayers: many(shadowTeamPlayers),
}));

export const metricDefinitionsRelations = relations(metricDefinitions, ({ many }) => ({
  reportMetrics: many(reportMetrics),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  player: one(players, {
    fields: [reports.playerId],
    references: [players.id],
  }),
  competition: one(competitions, {
    fields: [reports.competitionId],
    references: [competitions.id],
  }),
  reportMetrics: many(reportMetrics),
}));

export const reportMetricsRelations = relations(reportMetrics, ({ one }) => ({
  report: one(reports, {
    fields: [reportMetrics.reportId],
    references: [reports.id],
  }),
  metricDefinition: one(metricDefinitions, {
    fields: [reportMetrics.metricId],
    references: [metricDefinitions.id],
  }),
}));

export const shadowTeamsRelations = relations(shadowTeams, ({ many }) => ({
  players: many(shadowTeamPlayers),
}));

export const shadowTeamPlayersRelations = relations(shadowTeamPlayers, ({ one }) => ({
  shadowTeam: one(shadowTeams, {
    fields: [shadowTeamPlayers.shadowTeamId],
    references: [shadowTeams.id],
  }),
  player: one(players, {
    fields: [shadowTeamPlayers.playerId],
    references: [players.id],
  }),
}));

export type Season = typeof seasons.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type Club = typeof clubs.$inferSelect;
export type Country = typeof countries.$inferSelect;
export type Player = typeof players.$inferSelect;
export type MetricDefinition = typeof metricDefinitions.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ReportMetric = typeof reportMetrics.$inferSelect;
export type ShadowTeam = typeof shadowTeams.$inferSelect;
export type ShadowTeamPlayer = typeof shadowTeamPlayers.$inferSelect;

export type NewSeason = typeof seasons.$inferInsert;
export type NewCompetition = typeof competitions.$inferInsert;
export type NewPosition = typeof positions.$inferInsert;
export type NewClub = typeof clubs.$inferInsert;
export type NewCountry = typeof countries.$inferInsert;
export type NewPlayer = typeof players.$inferInsert;
export type NewMetricDefinition = typeof metricDefinitions.$inferInsert;
export type NewReport = typeof reports.$inferInsert;
export type NewReportMetric = typeof reportMetrics.$inferInsert;
export type NewShadowTeam = typeof shadowTeams.$inferInsert;
export type NewShadowTeamPlayer = typeof shadowTeamPlayers.$inferInsert;
