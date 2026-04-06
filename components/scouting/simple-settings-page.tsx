import { PageHeader } from "@/components/scouting/page-header";
import { ConfirmSubmitButton } from "@/components/scouting/confirm-submit-button";
import { FormField } from "@/components/scouting/form-field";
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

type Row = {
  id: number;
  name: string;
  displayOrder?: number;
  extra?: string;
  canDelete?: boolean;
};

export function SimpleSettingsPage({
  title,
  subtitle,
  createLabel,
  tableLabel,
  items,
  createAction,
  updateAction,
  deleteAction,
  includeDisplayOrder = false,
  notice,
}: {
  title: string;
  subtitle: string;
  createLabel: string;
  tableLabel: string;
  items: Row[];
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  includeDisplayOrder?: boolean;
  notice?: {
    tone: "error" | "info";
    title: string;
    description: string;
  };
}) {
  return (
    <section className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      {notice ? (
        <Card className={notice.tone === "error" ? "border-red-500/50" : "border-cyan-500/50"}>
          <CardHeader>
            <CardTitle className={notice.tone === "error" ? "text-red-200" : "text-cyan-200"}>
              {notice.title}
            </CardTitle>
          </CardHeader>
          <CardContent className={notice.tone === "error" ? "text-red-100/90" : "text-cyan-100/90"}>
            {notice.description}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{createLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 md:grid-cols-3">
            <FormField label="Nome" htmlFor="name" className="md:col-span-2">
              <Input id="name" name="name" required minLength={2} />
            </FormField>
            {includeDisplayOrder ? (
              <FormField label="Ordem" htmlFor="displayOrder">
                <Input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={0} />
              </FormField>
            ) : null}
            <div className={includeDisplayOrder ? "md:col-span-3" : "md:col-span-1"}>
              <Button>Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tableLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                {includeDisplayOrder ? <TableHead>Ordem</TableHead> : null}
                {items.some((item) => item.extra) ? <TableHead>Contexto</TableHead> : null}
                <TableHead className="w-[280px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="min-w-[280px]">
                    <form action={updateAction} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="id" value={item.id} />
                      <Input name="name" defaultValue={item.name} required minLength={2} />
                      {includeDisplayOrder ? (
                        <Input
                          name="displayOrder"
                          type="number"
                          min={0}
                          defaultValue={item.displayOrder ?? 0}
                          className="sm:w-28"
                        />
                      ) : null}
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                    </form>
                  </TableCell>
                  {includeDisplayOrder ? <TableCell>{item.displayOrder ?? 0}</TableCell> : null}
                  {items.some((row) => row.extra) ? <TableCell>{item.extra ?? "-"}</TableCell> : null}
                  <TableCell>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmSubmitButton
                        variant="danger"
                        size="sm"
                        message={`Eliminar "${item.name}"?`}
                        disabled={item.canDelete === false}
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
