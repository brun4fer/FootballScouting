import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { StatsCard } from "@/components/scouting/stats-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { aggregatePlayerSummaries, buildOverviewCards } from "@/lib/scouting-analytics";
import {
  getCompetitionOptions,
  getPositionOptions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, parseSearchDate, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TotalsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const competitionId = parseSearchId(params.competitionId);
  const positionId = parseSearchId(params.positionId);
  const dateFrom = parseSearchDate(params.dateFrom);
  const dateTo = parseSearchDate(params.dateTo);

  const [competitions, positions, reports] = await Promise.all([
    getCompetitionOptions(),
    getPositionOptions(),
    getReports({ competitionId, positionId, dateFrom, dateTo }),
  ]);

  const overview = buildOverviewCards(reports);
  const summaries = aggregatePlayerSummaries(reports);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Totais Gerais"
        subtitle="Vista global sobre todas as observacoes, com filtros opcionais por competicao, posicao e datas."
      />

      <FilterCard description="Aplicar filtros antes de consolidar o ranking global.">
        <FormField label="Competicao" htmlFor="competitionId">
          <SelectInput id="competitionId" name="competitionId" defaultValue={String(competitionId ?? "")}>
            <option value="">Todas</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Posicao" htmlFor="positionId">
          <SelectInput id="positionId" name="positionId" defaultValue={String(positionId ?? "")}>
            <option value="">Todas</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Data Inicial" htmlFor="dateFrom">
          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            defaultValue={dateFrom ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </FormField>
        <FormField label="Data Final" htmlFor="dateTo">
          <input
            id="dateTo"
            name="dateTo"
            type="date"
            defaultValue={dateTo ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </FormField>
      </FilterCard>

      <div className="card-grid">
        <StatsCard title="Jogadores" value={overview.players} />
        <StatsCard title="Relatorios" value={overview.reports} />
        <StatsCard title="Media Global" value={formatAverage(overview.averageOverall)} />
        <StatsCard title="Top Player" value={overview.topPlayer} />
      </div>

      {!summaries.length ? (
        <EmptyStateCard
          title="Sem resultados"
          description="Ajuste os filtros ou registe novos relatorios."
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead>Clube</TableHead>
                <TableHead>Posicoes</TableHead>
                <TableHead>Relatorios</TableHead>
                <TableHead>Global</TableHead>
                <TableHead>Ultimo Relatorio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.playerId}>
                  <TableCell>{summary.playerName}</TableCell>
                  <TableCell>{summary.clubName}</TableCell>
                  <TableCell>{summary.positionNames.join(", ") || "-"}</TableCell>
                  <TableCell>{summary.reportCount}</TableCell>
                  <TableCell>{formatAverage(summary.overallAverage)}</TableCell>
                  <TableCell>{summary.lastReportDate ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
