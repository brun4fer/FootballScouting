import { notFound } from "next/navigation";

import { deleteReportAction, updateReportAction } from "@/actions/scouting";
import { ConfirmSubmitButton } from "@/components/scouting/confirm-submit-button";
import { PageHeader } from "@/components/scouting/page-header";
import { ReportForm } from "@/components/scouting/report-form";
import { StatsCard } from "@/components/scouting/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCompetitionOptions,
  getPlayerOptions,
  getReportById,
} from "@/lib/scouting-data";
import { formatAverage, formatDate } from "@/lib/scouting-helpers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isFinite(reportId) || reportId <= 0) {
    notFound();
  }

  const [report, players, competitions] = await Promise.all([
    getReportById(reportId),
    getPlayerOptions(),
    getCompetitionOptions(),
  ]);

  if (!report) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Relatorio #${report.id}`}
        subtitle={`${report.playerName} | ${report.competitionName} | ${formatDate(report.reportDate)}`}
        action={
          <form action={deleteReportAction}>
            <input type="hidden" name="id" value={report.id} />
            <ConfirmSubmitButton variant="danger" message={`Eliminar o relatorio #${report.id}?`}>
              Eliminar
            </ConfirmSubmitButton>
          </form>
        }
      />

      <div className="card-grid">
        <StatsCard title="Ofensivo" value={formatAverage(report.offensiveAverage)} />
        <StatsCard title="Defensivo" value={formatAverage(report.defensiveAverage)} />
        <StatsCard title="Fisico" value={formatAverage(report.physicalAverage)} />
        <StatsCard title="Global" value={formatAverage(report.overallAverage)} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ReportForm
            action={updateReportAction}
            players={players}
            competitions={competitions}
            metrics={report.metrics}
            values={{
              id: report.id,
              playerId: report.playerId,
              competitionId: report.competitionId,
              reportDate: report.reportDate,
              observations: report.observations,
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
