import { createReportAction } from "@/actions/scouting";
import { ReportForm } from "@/components/scouting/report-form";
import { PageHeader } from "@/components/scouting/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCompetitionOptions,
  getMetricDefinitions,
  getPlayerOptions,
} from "@/lib/scouting-data";
import { parseSearchId } from "@/lib/scouting-helpers";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewReportPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const playerId = parseSearchId(params.playerId);

  const [players, competitions, metrics] = await Promise.all([
    getPlayerOptions(),
    getCompetitionOptions(),
    getMetricDefinitions(),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Novo Relatorio"
        subtitle="Criar uma nova observacao com metricas automaticas por categoria."
      />

      <Card>
        <CardContent className="pt-6">
          <ReportForm
            action={createReportAction}
            players={players}
            competitions={competitions}
            metrics={metrics.map((metric) => ({
              metricId: metric.id,
              name: metric.name,
              category: metric.category,
              displayOrder: metric.displayOrder,
              value: null,
            }))}
            values={{ playerId }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
