import { LineChart } from "@/components/charts/line-chart";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { StatsCard } from "@/components/scouting/stats-card";
import { ChartContainer } from "@/components/scouting/chart-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  aggregatePlayerSummaries,
  buildEvolutionSeries,
} from "@/lib/scouting-analytics";
import {
  getCompetitionOptions,
  getPlayerOptions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, formatDate, parseSearchDate, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlayerQueryPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const players = await getPlayerOptions();
  const selectedPlayerId = parseSearchId(params.playerId) ?? players[0]?.id;
  const competitionId = parseSearchId(params.competitionId);
  const dateFrom = parseSearchDate(params.dateFrom);
  const dateTo = parseSearchDate(params.dateTo);

  if (!selectedPlayerId) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Por Jogador"
          subtitle="Analise detalhada do historico individual do jogador selecionado."
        />
        <EmptyStateCard
          title="Sem jogadores"
          description="Crie um jogador para desbloquear esta consulta."
        />
      </section>
    );
  }

  const [competitions, reports] = await Promise.all([
    getCompetitionOptions(),
    getReports({ playerId: selectedPlayerId, competitionId, dateFrom, dateTo }),
  ]);

  const summary = aggregatePlayerSummaries(reports)[0];
  const evolutionSeries = buildEvolutionSeries(reports);
  const playerName = reports[0]?.playerName ?? players.find((player) => player.id === selectedPlayerId)?.name ?? "-";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Por Jogador"
        subtitle="Detalhe temporal e resumo medio do jogador selecionado."
      />

      <FilterCard description="Selecionar o jogador e o contexto competitivo para a analise.">
        <FormField label="Jogador" htmlFor="playerId">
          <SelectInput id="playerId" name="playerId" defaultValue={String(selectedPlayerId)}>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
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

      {!summary ? (
        <EmptyStateCard
          title="Sem relatorios"
          description="Nao existem observacoes para o jogador selecionado com os filtros atuais."
        />
      ) : (
        <>
          <div className="card-grid">
            <StatsCard title="Jogador" value={playerName} />
            <StatsCard title="Relatorios" value={summary.reportCount} />
            <StatsCard title="Media Global" value={formatAverage(summary.overallAverage)} />
            <StatsCard title="Ultimo Relatorio" value={summary.lastReportDate ?? "-"} />
          </div>

          <ChartContainer title="Evolucao do Jogador" description="Medias por categoria ao longo do tempo.">
            <LineChart
              data={evolutionSeries}
              xKey="label"
              series={[
                { key: "overallAverage", name: "Global", color: "#00e7ff" },
                { key: "offensiveAverage", name: "Ofensivo", color: "#84cc16" },
                { key: "defensiveAverage", name: "Defensivo", color: "#f97316" },
                { key: "physicalAverage", name: "Fisico", color: "#8b5cf6" },
                { key: "psychologicalAverage", name: "Psicologico", color: "#ff2ea6" },
              ]}
            />
          </ChartContainer>

          <div className="rounded-xl border border-border/70 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Competicao</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Global</TableHead>
                  <TableHead>Observacoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.reportDate)}</TableCell>
                    <TableCell>{report.competitionName}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>{formatAverage(report.overallAverage)}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{report.observations ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
