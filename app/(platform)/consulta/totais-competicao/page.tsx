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
import { aggregatePlayerSummaries } from "@/lib/scouting-analytics";
import { getCompetitionOptions, getReports } from "@/lib/scouting-data";
import { formatAverage, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetitionTotalsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const competitions = await getCompetitionOptions();
  const selectedCompetitionId = parseSearchId(params.competitionId) ?? competitions[0]?.id;

  if (!selectedCompetitionId) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Totais por Competicao"
          subtitle="Vista agregada por competicao para apoiar ranking e triagem inicial."
        />
        <EmptyStateCard
          title="Sem competicoes"
          description="Crie primeiro uma competicao nas configuracoes."
        />
      </section>
    );
  }

  const reports = await getReports({ competitionId: selectedCompetitionId });
  const summaries = aggregatePlayerSummaries(reports);
  const overallAverage =
    summaries.length > 0
      ? (
          summaries.reduce((total, summary) => total + summary.overallAverage, 0) / summaries.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Totais por Competicao"
        subtitle="Ranking agregado dos jogadores dentro da competicao selecionada."
      />

      <FilterCard description="Selecionar a competicao a analisar.">
        <FormField label="Competicao" htmlFor="competitionId">
          <SelectInput id="competitionId" name="competitionId" defaultValue={String(selectedCompetitionId)}>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </FilterCard>

      <div className="card-grid">
        <StatsCard title="Jogadores" value={summaries.length} />
        <StatsCard title="Relatorios" value={reports.length} />
        <StatsCard title="Media Global" value={overallAverage} />
        <StatsCard title="Melhor Rating" value={formatAverage(summaries[0]?.overallAverage)} />
      </div>

      {!summaries.length ? (
        <EmptyStateCard
          title="Sem relatorios"
          description="Nao existem observacoes para a competicao selecionada."
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
                <TableHead>Of.</TableHead>
                <TableHead>Def.</TableHead>
                <TableHead>Fis.</TableHead>
                <TableHead>Psi.</TableHead>
                <TableHead>Global</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.playerId}>
                  <TableCell>{summary.playerName}</TableCell>
                  <TableCell>{summary.clubName}</TableCell>
                  <TableCell>{summary.positionNames.join(", ") || "-"}</TableCell>
                  <TableCell>{summary.reportCount}</TableCell>
                  <TableCell>{formatAverage(summary.offensiveAverage)}</TableCell>
                  <TableCell>{formatAverage(summary.defensiveAverage)}</TableCell>
                  <TableCell>{formatAverage(summary.physicalAverage)}</TableCell>
                  <TableCell>{formatAverage(summary.psychologicalAverage)}</TableCell>
                  <TableCell>{formatAverage(summary.overallAverage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
