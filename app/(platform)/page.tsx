import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/scouting/page-header";
import { StatsCard } from "@/components/scouting/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOverviewCounts } from "@/lib/scouting-data";

const quickLinks = [
  {
    href: "/jogadores",
    label: "Jogadores",
    description: "Gerir perfis, contexto competitivo e historico de observacoes.",
  },
  {
    href: "/relatorios",
    label: "Relatorios",
    description: "Criar observacoes, preencher metricas e manter rascunhos.",
  },
  {
    href: "/consulta/totais-competicao",
    label: "Consulta",
    description: "Analisar totais, evolucao temporal e comparacoes entre jogadores.",
  },
];

export default async function HomePage() {
  const overview = await getOverviewCounts();

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          Base de scouting ativa
        </Badge>
        <PageHeader
          title="Plataforma de Scouting"
          subtitle="Mesma base visual e estrutural do sistema original, adaptada para observacao qualitativa, comparacao e decisao de recrutamento."
        />
      </div>

      <div className="card-grid">
        <StatsCard title="Jogadores" value={overview.players} />
        <StatsCard title="Relatorios" value={overview.reports} />
        <StatsCard title="Equipas Sombra" value={overview.shadowTeams} />
        <StatsCard title="Competicoes" value={overview.competitions} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
          <Card key={item.href} className="border-border/60">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={item.href}>
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
