import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateCard } from "@/components/scouting/empty-state-card";
import { PageHeader } from "@/components/scouting/page-header";
import { getShadowTeams } from "@/lib/scouting-data";

export default async function ShadowTeamsPage() {
  const shadowTeams = await getShadowTeams();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Equipa Sombra"
        subtitle="Gerir shortlists e agrupar jogadores por necessidade de recrutamento."
        action={
          <Button asChild>
            <Link href="/equipa-sombra/nova">Nova Equipa Sombra</Link>
          </Button>
        }
      />

      {!shadowTeams.length ? (
        <EmptyStateCard
          title="Sem equipas sombra"
          description="Crie uma shortlist para comecar a organizar candidatos."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shadowTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {team.notes || "Sem notas adicionais."}
                </p>
                <p className="text-sm text-cyan-200">{team.playerCount} jogadores</p>
                <Button asChild variant="outline">
                  <Link href={`/equipa-sombra/${team.id}`}>Abrir shortlist</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
