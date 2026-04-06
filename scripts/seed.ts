import "dotenv/config";

import { db } from "../db";
import { metricDefinitions, positions } from "../db/schema";
import { DEFAULT_METRIC_DEFINITIONS } from "../lib/default-metrics";
import { DEFAULT_POSITIONS } from "../lib/default-positions";

async function main() {
  await db.insert(positions).values(DEFAULT_POSITIONS).onConflictDoNothing();
  await db.insert(metricDefinitions).values(DEFAULT_METRIC_DEFINITIONS).onConflictDoNothing();

  console.log("Seed concluido: posicoes e metricas base inseridas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
