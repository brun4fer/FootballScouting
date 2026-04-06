import type { NewMetricDefinition } from "@/db/schema";

export const DEFAULT_METRIC_DEFINITIONS: Array<
  Pick<NewMetricDefinition, "category" | "name" | "displayOrder">
> = [
  { category: "offensive", name: "Passe Curto", displayOrder: 1 },
  { category: "offensive", name: "Passe Vertical", displayOrder: 2 },
  { category: "offensive", name: "Passe Longo", displayOrder: 3 },
  { category: "offensive", name: "Drible", displayOrder: 4 },
  { category: "offensive", name: "Finalizacao", displayOrder: 5 },
  { category: "defensive", name: "1x1 Defensivo", displayOrder: 1 },
  { category: "defensive", name: "Tackles", displayOrder: 2 },
  { category: "defensive", name: "Posicionamento", displayOrder: 3 },
  { category: "defensive", name: "Intercecao", displayOrder: 4 },
  { category: "defensive", name: "Pressao", displayOrder: 5 },
  { category: "physical", name: "Velocidade", displayOrder: 1 },
  { category: "physical", name: "Forca", displayOrder: 2 },
  { category: "physical", name: "Mobilidade", displayOrder: 3 },
  { category: "physical", name: "Resistencia", displayOrder: 4 },
  { category: "physical", name: "Explosao", displayOrder: 5 },
  { category: "psychological", name: "Decisao", displayOrder: 1 },
  { category: "psychological", name: "Resiliencia", displayOrder: 2 },
  { category: "psychological", name: "Disciplina", displayOrder: 3 },
  { category: "psychological", name: "Concentracao", displayOrder: 4 },
  { category: "psychological", name: "Lideranca", displayOrder: 5 },
];
