import {
  createCompetitionAction,
  deleteCompetitionAction,
  updateCompetitionAction,
} from "@/actions/scouting";
import { ConfirmSubmitButton } from "@/components/scouting/confirm-submit-button";
import { FormField } from "@/components/scouting/form-field";
import { PageHeader } from "@/components/scouting/page-header";
import { SelectInput } from "@/components/scouting/select-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCompetitions, getSeasons } from "@/lib/scouting-data";

export default async function CompetitionsPage() {
  const [competitions, seasons] = await Promise.all([getCompetitions(), getSeasons()]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Competicoes"
        subtitle="Associar cada competicao a uma epoca para manter o contexto competitivo dos relatórios."
      />

      <Card>
        <CardHeader>
          <CardTitle>Criar Competicao</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCompetitionAction} className="grid gap-4 md:grid-cols-3">
            <FormField label="Nome" htmlFor="name" className="md:col-span-2">
              <Input id="name" name="name" required minLength={2} />
            </FormField>
            <FormField label="Epoca" htmlFor="seasonId">
              <SelectInput id="seasonId" name="seasonId" defaultValue="" required>
                <option value="" disabled>
                  Selecionar epoca
                </option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <div className="md:col-span-3">
              <Button>Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competicoes Registadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Epoca</TableHead>
                <TableHead className="w-[280px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell>{competition.id}</TableCell>
                  <TableCell>
                    <form action={updateCompetitionAction} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="id" value={competition.id} />
                      <Input name="name" defaultValue={competition.name} required minLength={2} />
                      <SelectInput name="seasonId" defaultValue={String(competition.seasonId)} className="sm:w-48">
                        {seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            {season.name}
                          </option>
                        ))}
                      </SelectInput>
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{competition.seasonName}</TableCell>
                  <TableCell>
                    <form action={deleteCompetitionAction}>
                      <input type="hidden" name="id" value={competition.id} />
                      <ConfirmSubmitButton
                        variant="danger"
                        size="sm"
                        message={`Eliminar "${competition.name}"?`}
                      >
                        Eliminar
                      </ConfirmSubmitButton>
                    </form>
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
