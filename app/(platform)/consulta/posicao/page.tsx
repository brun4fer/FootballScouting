import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { aggregatePlayerSummaries } from "@/lib/scouting-analytics";
import {
  getCompetitionOptions,
  getPositionOptions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, parseSearchDate, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PositionQueryPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const positions = await getPositionOptions();
  const selectedPositionId = parseSearchId(params.positionId) ?? positions[0]?.id;
  const competitionId = parseSearchId(params.competitionId);
  const dateFrom = parseSearchDate(params.dateFrom);
  const dateTo = parseSearchDate(params.dateTo);

  if (!selectedPositionId) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Por Posicao"
          subtitle="Ranking de jogadores dentro da posicao selecionada."
        />
        <EmptyStateCard
          title="Sem posicoes"
          description="Crie posicoes nas configuracoes para usar esta consulta."
        />
      </section>
    );
  }

  const [competitions, reports] = await Promise.all([
    getCompetitionOptions(),
    getReports({ positionId: selectedPositionId, competitionId, dateFrom, dateTo }),
  ]);

  const summaries = aggregatePlayerSummaries(reports);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Por Posicao"
        subtitle="Comparar jogadores que atuam na mesma posicao dentro do recorte escolhido."
      />

      <FilterCard description="Escolher a posicao e o contexto a comparar.">
        <FormField label="Posicao" htmlFor="positionId">
          <SelectInput id="positionId" name="positionId" defaultValue={String(selectedPositionId)}>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
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

      {!summaries.length ? (
        <EmptyStateCard
          title="Sem relatorios"
          description="Nao existem dados para a posicao selecionada."
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead>Clube</TableHead>
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
