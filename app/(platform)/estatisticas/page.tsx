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
import { aggregatePlayerSummaries } from "@/lib/scouting-analytics";
import {
  getPlayers,
  getPositionOptions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StatisticsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const positionId = parseSearchId(params.positionId);

  const [players, positions, reports] = await Promise.all([
    getPlayers({ positionId }),
    getPositionOptions(),
    getReports({ positionId }),
  ]);

  const summaries = aggregatePlayerSummaries(reports);
  const summaryMap = new Map(summaries.map((summary) => [summary.playerId, summary]));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Estatisticas"
        subtitle="Lista global de jogadores com filtro por posicao e perfil resumido."
      />

      <FilterCard description="Filtrar a lista estatistica por posicao.">
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
      </FilterCard>

      <div className="card-grid">
        <StatsCard title="Jogadores" value={players.length} />
        <StatsCard title="Com Relatorios" value={summaries.length} />
        <StatsCard title="Media da Base" value={formatAverage(
          summaries.length
            ? summaries.reduce((total, summary) => total + summary.overallAverage, 0) / summaries.length
            : 0,
        )} />
        <StatsCard title="Top Perfil" value={summaries[0]?.playerName ?? "-"} />
      </div>

      {!players.length ? (
        <EmptyStateCard
          title="Sem jogadores"
          description="Nao existem jogadores para o filtro selecionado."
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead>Clube</TableHead>
                <TableHead>Posicoes</TableHead>
                <TableHead>Golos</TableHead>
                <TableHead>Assistencias</TableHead>
                <TableHead>Media Global</TableHead>
                <TableHead>Relatorios</TableHead>
                <TableHead className="w-[120px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => {
                const summary = summaryMap.get(player.id);
                return (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.clubName}</TableCell>
                    <TableCell>{player.positionNames.join(", ") || "-"}</TableCell>
                    <TableCell>{player.goals}</TableCell>
                    <TableCell>{player.assists}</TableCell>
                    <TableCell>{formatAverage(summary?.overallAverage)}</TableCell>
                    <TableCell>{summary?.reportCount ?? 0}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/jogadores/${player.id}`}>Abrir</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
