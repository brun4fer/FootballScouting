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
import { FilterCard } from "@/components/scouting/filter-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { aggregatePlayerSummaries } from "@/lib/scouting-analytics";
import {
  getClubs,
  getCountries,
  getPlayers,
  getPositions,
  getReports,
} from "@/lib/scouting-data";
import { formatAverage, parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlayersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const positionId = parseSearchId(params.positionId);
  const clubId = parseSearchId(params.clubId);
  const countryId = parseSearchId(params.countryId);

  const [players, positions, clubs, countries, reports] = await Promise.all([
    getPlayers({ positionId, clubId, countryId }),
    getPositions(),
    getClubs(),
    getCountries(),
    getReports(),
  ]);

  const summaries = aggregatePlayerSummaries(reports);
  const summaryMap = new Map(summaries.map((summary) => [summary.playerId, summary]));

  return (
    <section className="space-y-6">
      <PageHeader
        title="Jogadores"
        subtitle="Lista central de perfis observados, com acesso rapido a detalhe, relatorios e media global."
        action={
          <Button asChild>
            <Link href="/jogadores/novo">Novo Jogador</Link>
          </Button>
        }
      />

      <FilterCard description="Filtrar por contexto base do perfil antes de abrir o detalhe do jogador.">
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
        <FormField label="Clube" htmlFor="clubId">
          <SelectInput id="clubId" name="clubId" defaultValue={String(clubId ?? "")}>
            <option value="">Todos</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Pais" htmlFor="countryId">
          <SelectInput id="countryId" name="countryId" defaultValue={String(countryId ?? "")}>
            <option value="">Todos</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </FilterCard>

      {!players.length ? (
        <EmptyStateCard
          title="Sem jogadores"
          description="Adicione um jogador para comecar o fluxo de scouting."
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead>Clube</TableHead>
                <TableHead>Nacionalidade</TableHead>
                <TableHead>Posicoes</TableHead>
                <TableHead>Golos</TableHead>
                <TableHead>Assistencias</TableHead>
                <TableHead>Media Global</TableHead>
                <TableHead>Relatorios</TableHead>
                <TableHead className="w-[180px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => {
                const summary = summaryMap.get(player.id);

                return (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.clubName}</TableCell>
                    <TableCell>{player.countryName}</TableCell>
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
