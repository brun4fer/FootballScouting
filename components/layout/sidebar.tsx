"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardPen, Database, Eye, Home, Shield, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Resumo", icon: Home },
  {
    href: "/configuracoes/epocas",
    label: "Configuracoes",
    icon: Database,
    children: [
      { href: "/configuracoes/epocas", label: "Epocas" },
      { href: "/configuracoes/competicoes", label: "Competicoes" },
      { href: "/configuracoes/posicoes", label: "Posicoes" },
      { href: "/configuracoes/clubes", label: "Clubes" },
      { href: "/configuracoes/paises", label: "Paises" },
    ],
  },
  { href: "/jogadores", label: "Jogadores", icon: Users },
  { href: "/relatorios", label: "Relatorios", icon: ClipboardPen },
  {
    href: "/consulta/totais-competicao",
    label: "Consulta",
    icon: BarChart3,
    children: [
      { href: "/consulta/totais-competicao", label: "Totais por Competicao" },
      { href: "/consulta/totais", label: "Totais Gerais" },
      { href: "/consulta/jogador", label: "Por Jogador" },
      { href: "/consulta/posicao", label: "Por Posicao" },
      { href: "/consulta/evolucao", label: "Evolucao" },
      { href: "/consulta/comparacao", label: "Comparacao" },
    ],
  },
  { href: "/equipa-sombra", label: "Equipa Sombra", icon: Shield },
  { href: "/estatisticas", label: "Estatisticas", icon: Eye },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/60 bg-card/60 backdrop-blur md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-border/60 p-4">
        <p className="font-semibold tracking-wide text-cyan-300">G.A.P. - Scouting</p>
        <p className="text-xs text-muted-foreground">Gestao e analise de observacoes</p>
      </div>
      <nav className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
        {links.map(({ href, label, icon: Icon, children }) => {
          const childActive = children?.some((child) => pathname === child.href) ?? false;
          const active =
            childActive || pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

          if (children?.length) {
            return (
              <div key={href} className="col-span-2 space-y-1 md:col-span-1">
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/50"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{label}</span>
                </Link>

                <div className="grid gap-1 pl-4 md:pl-9">
                  {children.map((child) => {
                    const childIsActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          childIsActive
                            ? "bg-secondary/15 text-secondary ring-1 ring-secondary/40"
                            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/50"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
