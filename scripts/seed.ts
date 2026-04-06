import "dotenv/config";

import { db } from "../db";
import { metricDefinitions, positions } from "../db/schema";
import { DEFAULT_METRIC_DEFINITIONS } from "../lib/default-metrics";

const DEFAULT_POSITIONS = [
  { name: "GR", displayOrder: 1 },
  { name: "DD", displayOrder: 2 },
  { name: "DC", displayOrder: 3 },
  { name: "DE", displayOrder: 4 },
  { name: "MDC", displayOrder: 5 },
  { name: "MC", displayOrder: 6 },
  { name: "MAC", displayOrder: 7 },
  { name: "ED", displayOrder: 8 },
  { name: "EE", displayOrder: 9 },
  { name: "PL", displayOrder: 10 },
];

async function main() {
  await db.insert(positions).values(DEFAULT_POSITIONS).onConflictDoNothing();
  await db.insert(metricDefinitions).values(DEFAULT_METRIC_DEFINITIONS).onConflictDoNothing();

  console.log("Seed concluido: posicoes e metricas base inseridas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
