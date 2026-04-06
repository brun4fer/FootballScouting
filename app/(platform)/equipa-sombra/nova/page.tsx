import { createShadowTeamAction } from "@/actions/scouting";
import { PageHeader } from "@/components/scouting/page-header";
import { ShadowTeamForm } from "@/components/scouting/shadow-team-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewShadowTeamPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Nova Equipa Sombra"
        subtitle="Criar uma shortlist para agrupar candidatos por funcao ou prioridade."
      />

      <Card>
        <CardContent className="pt-6">
          <ShadowTeamForm action={createShadowTeamAction} submitLabel="Guardar Equipa Sombra" />
        </CardContent>
      </Card>
    </section>
  );
}
