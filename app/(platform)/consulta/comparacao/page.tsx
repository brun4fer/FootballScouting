import { BarChart } from "@/components/charts/bar-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { ChartContainer } from "@/components/scouting/chart-container";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { MultiSelect } from "@/components/scouting/multi-select";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import {
  buildComparisonRadarData,
  buildComparisonRows,
} from "@/lib/scouting-analytics";
import {
  getCompetitionOptions,
  getPlayerOptions,
  getReports,
} from "@/lib/scouting-data";
import { parseSearchDate, parseSearchId, parseSearchIds } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparisonPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const competitionId = parseSearchId(params.competitionId);
  const dateFrom = parseSearchDate(params.dateFrom);
  const dateTo = parseSearchDate(params.dateTo);
  const selectedPlayerIds = parseSearchIds(params.playerIds);

  const [players, competitions, reports] = await Promise.all([
    getPlayerOptions(),
    getCompetitionOptions(),
    getReports({
      playerIds: selectedPlayerIds.length ? selectedPlayerIds : undefined,
      competitionId,
      dateFrom,
      dateTo,
    }),
  ]);

  const comparisonRows = buildComparisonRows(reports);
  const scopedRows = selectedPlayerIds.length ? comparisonRows : comparisonRows.slice(0, 4);
  const radarData = buildComparisonRadarData(scopedRows);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Comparacao"
        subtitle="Comparar jogadores com barras e radar, sem sobrecarga visual."
      />

      <FilterCard description="Selecionar varios jogadores e opcionalmente restringir por competicao e datas.">
        <FormField label="Jogadores" htmlFor="playerIds" className="xl:col-span-2">
          <MultiSelect id="playerIds" name="playerIds" defaultValue={selectedPlayerIds.map(String)}>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </MultiSelect>
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

      {!scopedRows.length ? (
        <EmptyStateCard
          title="Sem comparacao"
          description="Selecione jogadores com relatorios dentro do filtro aplicado."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartContainer title="Comparacao por Barra" description="Media de cada categoria por jogador.">
            <BarChart
              data={scopedRows}
              xKey="label"
              series={[
                { key: "overallAverage", name: "Global", color: "#00e7ff" },
                { key: "offensiveAverage", name: "Ofensivo", color: "#84cc16" },
                { key: "defensiveAverage", name: "Defensivo", color: "#f97316" },
                { key: "physicalAverage", name: "Fisico", color: "#8b5cf6" },
              ]}
            />
          </ChartContainer>
          <ChartContainer title="Radar Comparativo" description="Leitura compacta do perfil medio por categoria.">
            <RadarChart
              data={radarData}
              angleKey="metric"
              series={scopedRows.map((row, index) => ({
                key: row.label,
                name: row.label,
                color: ["#00e7ff", "#ff2ea6", "#84cc16", "#f97316"][index % 4],
              }))}
            />
          </ChartContainer>
        </div>
      )}
    </section>
  );
}
