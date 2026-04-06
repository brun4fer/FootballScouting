import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePlayerAction, updatePlayerAction } from "@/actions/scouting";
import { LineChart } from "@/components/charts/line-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { ChartContainer } from "@/components/scouting/chart-container";
import { ConfirmSubmitButton } from "@/components/scouting/confirm-submit-button";
import { PageHeader } from "@/components/scouting/page-header";
import { PlayerForm } from "@/components/scouting/player-form";
import { StatsCard } from "@/components/scouting/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  buildRadarData,
} from "@/lib/scouting-analytics";
import {
  getClubs,
  getCountries,
  getPlayerById,
  getPlayerReports,
  getPositions,
} from "@/lib/scouting-data";
import { formatAverage, formatDate } from "@/lib/scouting-helpers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    notFound();
  }

  const [player, clubs, countries, positions, reports] = await Promise.all([
    getPlayerById(playerId),
    getClubs(),
    getCountries(),
    getPositions(),
    getPlayerReports(playerId),
  ]);

  if (!player) {
    notFound();
  }

  const summary = aggregatePlayerSummaries(reports)[0];
  const evolutionSeries = buildEvolutionSeries(reports);
  const radarData = summary ? buildRadarData(summary) : [];

  return (
    <section className="space-y-6">
      <PageHeader
        title={player.name}
        subtitle={`${player.clubName} | ${player.countryName} | ${player.positionNames.join(", ") || "Sem posicoes"}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/relatorios/novo?playerId=${player.id}`}>Novo Relatorio</Link>
            </Button>
            <form action={deletePlayerAction}>
              <input type="hidden" name="id" value={player.id} />
              <ConfirmSubmitButton variant="danger" message={`Eliminar "${player.name}"?`}>
                Eliminar
              </ConfirmSubmitButton>
            </form>
          </div>
        }
      />

      <div className="card-grid">
        <StatsCard title="Media Global" value={formatAverage(summary?.overallAverage)} />
        <StatsCard title="Relatorios" value={summary?.reportCount ?? 0} />
        <StatsCard title="Golos" value={player.goals} />
        <StatsCard title="Assistencias" value={player.assists} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <PlayerForm
            action={updatePlayerAction}
            submitLabel="Atualizar Jogador"
            clubs={clubs}
            countries={countries}
            positions={positions}
            values={player}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartContainer title="Evolucao Temporal" description="Series por relatorio ao longo do tempo.">
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
        <ChartContainer title="Perfil Medio" description="Radar por categoria com base no historico do jogador.">
          <RadarChart
            data={radarData.map((entry) => ({
              metric: entry.metric,
              [player.name]: entry.value,
            }))}
            angleKey="metric"
            series={[{ key: player.name, name: player.name, color: "#00e7ff" }]}
          />
        </ChartContainer>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Competicao</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Media Global</TableHead>
                <TableHead>Observacoes</TableHead>
                <TableHead className="w-[120px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{formatDate(report.reportDate)}</TableCell>
                  <TableCell>{report.competitionName}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>{formatAverage(report.overallAverage)}</TableCell>
                  <TableCell className="max-w-[320px] truncate">{report.observations ?? "-"}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/relatorios/${report.id}`}>Abrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
