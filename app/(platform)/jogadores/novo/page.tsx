import { createPlayerAction } from "@/actions/scouting";
import { PlayerForm } from "@/components/scouting/player-form";
import { PageHeader } from "@/components/scouting/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getClubs, getCountries, getPositions } from "@/lib/scouting-data";

export default async function NewPlayerPage() {
  const [clubs, countries, positions] = await Promise.all([
    getClubs(),
    getCountries(),
    getPositions(),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Novo Jogador"
        subtitle="Criar um perfil completo de scouting com contexto competitivo e posicional."
      />

      <Card>
        <CardContent className="pt-6">
          <PlayerForm
            action={createPlayerAction}
            submitLabel="Guardar Jogador"
            clubs={clubs}
            countries={countries}
            positions={positions}
          />
        </CardContent>
      </Card>
    </section>
  );
}
