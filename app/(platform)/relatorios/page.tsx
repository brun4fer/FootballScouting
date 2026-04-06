import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { StatsCard } from "@/components/scouting/stats-card";
import {
  getCompetitionOptions,
  getPlayerOptions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, formatDate, parseSearchDate, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const playerId = parseSearchId(params.playerId);
  const competitionId = parseSearchId(params.competitionId);
  const dateFrom = parseSearchDate(params.dateFrom);
  const dateTo = parseSearchDate(params.dateTo);
  const status = typeof params.status === "string" ? params.status : "all";

  const [reports, players, competitions] = await Promise.all([
    getReports({
      playerId,
      competitionId,
      dateFrom,
      dateTo,
      status: status === "draft" || status === "published" ? status : "all",
    }),
    getPlayerOptions(),
    getCompetitionOptions(),
  ]);

  const draftCount = reports.filter((report) => report.status === "draft").length;
  const publishedCount = reports.filter((report) => report.status === "published").length;
  const averageOverall =
    reports.length > 0
      ? (
          reports.reduce((total, report) => total + Number(report.overallAverage ?? 0), 0) /
          reports.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Relatorios"
        subtitle="Lista central de observacoes por jogo ou treino, com estado de rascunho e medias calculadas."
        action={
          <Button asChild>
            <Link href="/relatorios/novo">Novo Relatorio</Link>
          </Button>
        }
      />

      <div className="card-grid">
        <StatsCard title="Total" value={reports.length} />
        <StatsCard title="Rascunhos" value={draftCount} />
        <StatsCard title="Publicados" value={publishedCount} />
        <StatsCard title="Media Global" value={averageOverall} />
      </div>

      <FilterCard description="Filtrar relatorios por jogador, competicao e janela temporal.">
        <FormField label="Jogador" htmlFor="playerId">
          <SelectInput id="playerId" name="playerId" defaultValue={String(playerId ?? "")}>
            <option value="">Todos</option>
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
        <FormField label="Estado" htmlFor="status">
          <SelectInput id="status" name="status" defaultValue={status}>
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </SelectInput>
        </FormField>
      </FilterCard>

      {!reports.length ? (
        <EmptyStateCard
          title="Sem relatorios"
          description="Crie um relatorio para iniciar a base observacional."
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead>Competicao</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Of.</TableHead>
                <TableHead>Def.</TableHead>
                <TableHead>Fis.</TableHead>
                <TableHead>Psi.</TableHead>
                <TableHead>Global</TableHead>
                <TableHead className="w-[120px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{formatDate(report.reportDate)}</TableCell>
                  <TableCell>{report.playerName}</TableCell>
                  <TableCell>{report.competitionName}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>{formatAverage(report.offensiveAverage)}</TableCell>
                  <TableCell>{formatAverage(report.defensiveAverage)}</TableCell>
                  <TableCell>{formatAverage(report.physicalAverage)}</TableCell>
                  <TableCell>{formatAverage(report.psychologicalAverage)}</TableCell>
                  <TableCell>{formatAverage(report.overallAverage)}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/relatorios/${report.id}`}>Abrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
