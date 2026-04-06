import { FormField } from "@/components/scouting/form-field";
import { SelectInput } from "@/components/scouting/select-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildMetricInputName, formatMetricCategory } from "@/lib/scouting-helpers";

type Option = {
  id: number;
  name: string;
};

type MetricValue = {
  metricId: number;
  name: string;
  category: "offensive" | "defensive" | "physical" | "psychological";
  displayOrder: number;
  value: number | null;
};

type ReportFormValues = {
  id?: number;
  playerId?: number;
  competitionId?: number;
  reportDate?: string;
  observations?: string | null;
};

export function ReportForm({
  action,
  players,
  competitions,
  metrics,
  values,
}: {
  action: (formData: FormData) => void | Promise<void>;
  players: Option[];
  competitions: Option[];
  metrics: MetricValue[];
  values?: ReportFormValues;
}) {
  const groupedMetrics = metrics.reduce<Record<string, MetricValue[]>>((accumulator, metric) => {
    const list = accumulator[metric.category] ?? [];
    list.push(metric);
    accumulator[metric.category] = list;
    return accumulator;
  }, {});

  return (
    <form action={action} className="space-y-6">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Dados do Relatorio</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Jogador" htmlFor="playerId">
            <SelectInput
              id="playerId"
              name="playerId"
              defaultValue={String(values?.playerId ?? "")}
              required
            >
              <option value="" disabled>
                Selecionar jogador
              </option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Competicao" htmlFor="competitionId">
            <SelectInput
              id="competitionId"
              name="competitionId"
              defaultValue={String(values?.competitionId ?? "")}
              required
            >
              <option value="" disabled>
                Selecionar competicao
              </option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Data" htmlFor="reportDate">
            <Input id="reportDate" name="reportDate" type="date" defaultValue={values?.reportDate ?? ""} required />
          </FormField>

          <FormField
            label="Observacoes"
            htmlFor="observations"
            className="md:col-span-2 xl:col-span-4"
          >
            <Textarea
              id="observations"
              name="observations"
              defaultValue={values?.observations ?? ""}
              rows={5}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{formatMetricCategory(category as MetricValue["category"])}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {categoryMetrics
                .sort((left, right) => left.displayOrder - right.displayOrder)
                .map((metric) => (
                  <FormField
                    key={metric.metricId}
                    label={metric.name}
                    htmlFor={buildMetricInputName(metric.metricId)}
                    hint="Escala de 1 a 10"
                  >
                    <Input
                      id={buildMetricInputName(metric.metricId)}
                      name={buildMetricInputName(metric.metricId)}
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={metric.value ?? undefined}
                    />
                  </FormField>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" name="status" value="draft">
          Guardar Rascunho
        </Button>
        <Button name="status" value="published">
          Guardar Relatorio
        </Button>
      </div>
    </form>
  );
}
