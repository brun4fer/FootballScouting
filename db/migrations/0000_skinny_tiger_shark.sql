CREATE TYPE "public"."metric_category" AS ENUM('offensive', 'defensive', 'physical', 'psychological');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"season_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metric_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "metric_category" NOT NULL,
	"name" varchar(120) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"photo" text,
	"club_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"height" integer,
	"weight" integer,
	"agent" varchar(160),
	"position1_id" integer NOT NULL,
	"position2_id" integer,
	"position3_id" integer,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"metric_id" integer NOT NULL,
	"value" integer
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
	"report_date" date NOT NULL,
	"observations" text,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"offensive_average" real DEFAULT 0 NOT NULL,
	"defensive_average" real DEFAULT 0 NOT NULL,
	"physical_average" real DEFAULT 0 NOT NULL,
	"psychological_average" real DEFAULT 0 NOT NULL,
	"overall_average" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shadow_team_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"shadow_team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shadow_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(140) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_position1_id_positions_id_fk" FOREIGN KEY ("position1_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_position2_id_positions_id_fk" FOREIGN KEY ("position2_id") REFERENCES "public"."positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_position3_id_positions_id_fk" FOREIGN KEY ("position3_id") REFERENCES "public"."positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_metric_id_metric_definitions_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metric_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shadow_team_players" ADD CONSTRAINT "shadow_team_players_shadow_team_id_shadow_teams_id_fk" FOREIGN KEY ("shadow_team_id") REFERENCES "public"."shadow_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shadow_team_players" ADD CONSTRAINT "shadow_team_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clubs_name_unique" ON "clubs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "competitions_season_id_idx" ON "competitions" USING btree ("season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competitions_name_season_unique" ON "competitions" USING btree ("name","season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_name_unique" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "metric_definitions_category_idx" ON "metric_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "metric_definitions_category_order_idx" ON "metric_definitions" USING btree ("category","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "metric_definitions_category_name_unique" ON "metric_definitions" USING btree ("category","name");--> statement-breakpoint
CREATE INDEX "players_name_idx" ON "players" USING btree ("name");--> statement-breakpoint
CREATE INDEX "players_club_id_idx" ON "players" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "players_country_id_idx" ON "players" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "players_position1_id_idx" ON "players" USING btree ("position1_id");--> statement-breakpoint
CREATE UNIQUE INDEX "positions_name_unique" ON "positions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "positions_display_order_idx" ON "positions" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "report_metrics_report_id_idx" ON "report_metrics" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "report_metrics_metric_id_idx" ON "report_metrics" USING btree ("metric_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_metrics_report_metric_unique" ON "report_metrics" USING btree ("report_id","metric_id");--> statement-breakpoint
CREATE INDEX "reports_player_id_idx" ON "reports" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "reports_competition_id_idx" ON "reports" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "reports_report_date_idx" ON "reports" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_name_unique" ON "seasons" USING btree ("name");--> statement-breakpoint
CREATE INDEX "shadow_team_players_shadow_team_id_idx" ON "shadow_team_players" USING btree ("shadow_team_id");--> statement-breakpoint
CREATE INDEX "shadow_team_players_player_id_idx" ON "shadow_team_players" USING btree ("player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shadow_team_players_unique" ON "shadow_team_players" USING btree ("shadow_team_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shadow_teams_name_unique" ON "shadow_teams" USING btree ("name");