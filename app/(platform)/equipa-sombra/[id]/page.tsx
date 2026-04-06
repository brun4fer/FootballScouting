import { notFound } from "next/navigation";

import {
  addShadowTeamPlayerAction,
  deleteShadowTeamAction,
  removeShadowTeamPlayerAction,
  updateShadowTeamAction,
} from "@/actions/scouting";
import { BarChart } from "@/components/charts/bar-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { ChartContainer } from "@/components/scouting/chart-container";
import { ConfirmSubmitButton } from "@/components/scouting/confirm-submit-button";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { ShadowTeamForm } from "@/components/scouting/shadow-team-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  aggregatePlayerSummaries,
  buildComparisonRadarData,
  buildComparisonRows,
} from "@/lib/scouting-analytics";
import {
  getPlayers,
  getReports,
  getShadowTeamById,
} from "@/lib/scouting-data";
import { formatAverage } from "@/lib/scouting-helpers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShadowTeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const shadowTeamId = Number(id);
  if (!Number.isFinite(shadowTeamId) || shadowTeamId <= 0) {
    notFound();
  }

  const shadowTeam = await getShadowTeamById(shadowTeamId);
  if (!shadowTeam) {
    notFound();
  }

  const [allPlayers, reports] = await Promise.all([
    getPlayers(),
    getReports({
      playerIds: shadowTeam.players.map((player) => player.id),
    }),
  ]);

  const availablePlayers = allPlayers.filter(
    (player) => !shadowTeam.players.some((shadowPlayer) => shadowPlayer.id === player.id),
  );
  const summaries = aggregatePlayerSummaries(reports);
  const comparisonRows = buildComparisonRows(reports).slice(0, 4);
  const radarData = buildComparisonRadarData(comparisonRows);

  return (
    <section className="space-y-6">
      <PageHeader
        title={shadowTeam.name}
        subtitle="Shortlist por posicao, media e comparacao interna."
        action={
          <form action={deleteShadowTeamAction}>
            <input type="hidden" name="id" value={shadowTeam.id} />
            <ConfirmSubmitButton variant="danger" message={`Eliminar "${shadowTeam.name}"?`}>
              Eliminar
            </ConfirmSubmitButton>
          </form>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <ShadowTeamForm
            action={updateShadowTeamAction}
            submitLabel="Atualizar Equipa Sombra"
            values={shadowTeam}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form action={addShadowTeamPlayerAction} className="flex flex-col gap-4 md:flex-row">
            <input type="hidden" name="shadowTeamId" value={shadowTeam.id} />
            <FormField label="Adicionar Jogador" htmlFor="playerId" className="flex-1">
              <SelectInput id="playerId" name="playerId" defaultValue="" required>
                <option value="" disabled>
                  Selecionar jogador
                </option>
                {availablePlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} | {player.clubName}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <div className="md:self-end">
              <Button>Adicionar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!shadowTeam.players.length ? (
        <EmptyStateCard
          title="Shortlist vazia"
          description="Adicione jogadores para ativar a comparacao interna."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartContainer title="Comparacao Interna" description="Barras por media de categoria.">
              <BarChart
                data={comparisonRows}
                xKey="label"
                series={[
                  { key: "overallAverage", name: "Global", color: "#00e7ff" },
                  { key: "offensiveAverage", name: "Ofensivo", color: "#84cc16" },
                  { key: "defensiveAverage", name: "Defensivo", color: "#f97316" },
                ]}
              />
            </ChartContainer>
            <ChartContainer title="Radar da Shortlist" description="Perfil medio dos jogadores com melhor rating.">
              <RadarChart
                data={radarData}
                angleKey="metric"
                series={comparisonRows.map((row, index) => ({
                  key: row.label,
                  name: row.label,
                  color: ["#00e7ff", "#ff2ea6", "#84cc16", "#f97316"][index % 4],
                }))}
              />
            </ChartContainer>
          </div>

          <div className="rounded-xl border border-border/70 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Posicoes</TableHead>
                  <TableHead>Clube</TableHead>
                  <TableHead>Relatorios</TableHead>
                  <TableHead>Global</TableHead>
                  <TableHead className="w-[180px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shadowTeam.players.map((player) => {
                  const summary = summaries.find((entry) => entry.playerId === player.id);

                  return (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.positionNames.join(", ") || "-"}</TableCell>
                      <TableCell>{player.clubName}</TableCell>
                      <TableCell>{summary?.reportCount ?? 0}</TableCell>
                      <TableCell>{formatAverage(summary?.overallAverage)}</TableCell>
                      <TableCell>
                        <form action={removeShadowTeamPlayerAction}>
                          <input type="hidden" name="shadowTeamId" value={shadowTeam.id} />
                          <input type="hidden" name="playerId" value={player.id} />
                          <ConfirmSubmitButton
                            variant="outline"
                            size="sm"
                            message={`Remover "${player.name}" da shortlist?`}
                          >
                            Remover
                          </ConfirmSubmitButton>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
