import type { NewPosition } from "@/db/schema";

export const DEFAULT_POSITIONS: Array<Pick<NewPosition, "name" | "displayOrder">> = [
  { name: "GR", displayOrder: 1 },
  { name: "DD", displayOrder: 2 },
  { name: "DC", displayOrder: 3 },
  { name: "DE", displayOrder: 4 },
  { name: "MDC", displayOrder: 5 },
  { name: "MC", displayOrder: 6 },
  { name: "MEI", displayOrder: 7 },
  { name: "ED", displayOrder: 8 },
  { name: "EE", displayOrder: 9 },
  { name: "PL", displayOrder: 10 },
];
