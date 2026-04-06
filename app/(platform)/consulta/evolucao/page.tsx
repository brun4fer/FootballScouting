import { LineChart } from "@/components/charts/line-chart";
import { ChartContainer } from "@/components/scouting/chart-container";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { getCompetitionOptions, getPlayerOptions, getReports } from "@/lib/scouting-data";
import { buildEvolutionSeries } from "@/lib/scouting-analytics";
import { parseSearchDate, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EvolutionPage({ searchParams }: PageProps) {
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
          title="Evolucao"
          subtitle="Leitura temporal da progressao das observacoes."
        />
        <EmptyStateCard
          title="Sem jogadores"
          description="Crie um jogador para analisar evolucao temporal."
        />
      </section>
    );
  }

  const [competitions, reports] = await Promise.all([
    getCompetitionOptions(),
    getReports({ playerId: selectedPlayerId, competitionId, dateFrom, dateTo }),
  ]);

  const evolutionSeries = buildEvolutionSeries(reports);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Evolucao"
        subtitle="Line charts por categoria, evitando clutter e mostrando apenas informacao util."
      />

      <FilterCard description="Escolher jogador e recorte temporal antes de gerar a serie.">
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

      {!evolutionSeries.length ? (
        <EmptyStateCard
          title="Sem dados de evolucao"
          description="Nao ha relatorios suficientes para o filtro aplicado."
        />
      ) : (
        <ChartContainer title="Serie Temporal" description="Uma linha por categoria e media global.">
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
      )}
    </section>
  );
}
