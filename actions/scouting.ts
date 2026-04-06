"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  clubs,
  competitions,
  countries,
  players,
  positions,
  reportMetrics,
  reports,
  seasons,
  shadowTeamPlayers,
  shadowTeams,
} from "@/db/schema";
import { ensureMetricDefinitions } from "@/lib/scouting-data";
import {
  buildMetricInputName,
  calculateReportAverages,
  isValidDateString,
  type ReportStatus,
} from "@/lib/scouting-helpers";
import { saveImageUpload } from "@/lib/upload";

function revalidateScoutingPaths() {
  [
    "/",
    "/configuracoes/epocas",
    "/configuracoes/competicoes",
    "/configuracoes/posicoes",
    "/configuracoes/clubes",
    "/configuracoes/paises",
    "/jogadores",
    "/relatorios",
    "/consulta/totais-competicao",
    "/consulta/totais",
    "/consulta/jogador",
    "/consulta/posicao",
    "/consulta/evolucao",
    "/consulta/comparacao",
    "/equipa-sombra",
    "/estatisticas",
  ].forEach((path) => revalidatePath(path));
}

function optionalText(value: FormDataEntryValue | null, maxLength = 255) {
  if (!value) {
    return null;
  }

  const parsed = String(value).trim();
  return parsed.length ? parsed.slice(0, maxLength) : null;
}

function optionalInt(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.floor(parsed));
}

function requiredId(value: FormDataEntryValue | null, fieldLabel: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldLabel} invalido.`);
  }

  return Math.floor(parsed);
}

function requiredDate(value: FormDataEntryValue | null, fieldLabel: string) {
  if (!value) {
    throw new Error(`${fieldLabel} obrigatoria.`);
  }

  const parsed = String(value);
  if (!isValidDateString(parsed)) {
    throw new Error(`${fieldLabel} deve estar no formato YYYY-MM-DD.`);
  }

  return parsed;
}

function parseReportStatus(value: FormDataEntryValue | null): ReportStatus {
  return value === "published" ? "published" : "draft";
}

async function replaceReportMetrics(reportId: number, formData: FormData) {
  const definitions = await ensureMetricDefinitions();
  const values = definitions.map((definition) => {
    const rawValue = formData.get(buildMetricInputName(definition.id));
    if (rawValue === null || String(rawValue).trim() === "") {
      return {
        metricId: definition.id,
        value: null,
      };
    }

    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 10) {
      throw new Error(`A metrica "${definition.name}" deve estar entre 1 e 10.`);
    }

    return {
      metricId: definition.id,
      value: Math.round(numericValue),
    };
  });

  await db.delete(reportMetrics).where(eq(reportMetrics.reportId, reportId));

  await db.insert(reportMetrics).values(
    values.map((entry) => ({
      reportId,
      metricId: entry.metricId,
      value: entry.value,
    })),
  );

  return calculateReportAverages(definitions, values);
}

export async function createSeasonAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome da epoca deve ter pelo menos 2 caracteres.");
  }

  await db.insert(seasons).values({ name }).onConflictDoNothing();
  revalidateScoutingPaths();
}

export async function updateSeasonAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Epoca");
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome da epoca deve ter pelo menos 2 caracteres.");
  }

  await db.update(seasons).set({ name }).where(eq(seasons.id, id));
  revalidateScoutingPaths();
}

export async function deleteSeasonAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Epoca");
  await db.delete(seasons).where(eq(seasons.id, id));
  revalidateScoutingPaths();
}

export async function createCompetitionAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  const seasonId = requiredId(formData.get("seasonId"), "Epoca");
  if (!name || name.length < 2) {
    throw new Error("O nome da competicao deve ter pelo menos 2 caracteres.");
  }

  await db.insert(competitions).values({ name, seasonId }).onConflictDoNothing();
  revalidateScoutingPaths();
}

export async function updateCompetitionAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Competicao");
  const name = optionalText(formData.get("name"), 120);
  const seasonId = requiredId(formData.get("seasonId"), "Epoca");
  if (!name || name.length < 2) {
    throw new Error("O nome da competicao deve ter pelo menos 2 caracteres.");
  }

  await db.update(competitions).set({ name, seasonId }).where(eq(competitions.id, id));
  revalidateScoutingPaths();
}

export async function deleteCompetitionAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Competicao");
  await db.delete(competitions).where(eq(competitions.id, id));
  revalidateScoutingPaths();
}

export async function createPositionAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 80);
  const displayOrder = optionalInt(formData.get("displayOrder")) ?? 0;
  if (!name || name.length < 2) {
    throw new Error("O nome da posicao deve ter pelo menos 2 caracteres.");
  }

  await db.insert(positions).values({ name, displayOrder }).onConflictDoNothing();
  revalidateScoutingPaths();
}

export async function updatePositionAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Posicao");
  const name = optionalText(formData.get("name"), 80);
  const displayOrder = optionalInt(formData.get("displayOrder")) ?? 0;
  if (!name || name.length < 2) {
    throw new Error("O nome da posicao deve ter pelo menos 2 caracteres.");
  }

  await db.update(positions).set({ name, displayOrder }).where(eq(positions.id, id));
  revalidateScoutingPaths();
}

export async function deletePositionAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Posicao");
  await db.delete(positions).where(eq(positions.id, id));
  revalidateScoutingPaths();
}

export async function createClubAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome do clube deve ter pelo menos 2 caracteres.");
  }

  await db.insert(clubs).values({ name }).onConflictDoNothing();
  revalidateScoutingPaths();
}

export async function updateClubAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Clube");
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome do clube deve ter pelo menos 2 caracteres.");
  }

  await db.update(clubs).set({ name }).where(eq(clubs.id, id));
  revalidateScoutingPaths();
}

export async function deleteClubAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Clube");
  await db.delete(clubs).where(eq(clubs.id, id));
  revalidateScoutingPaths();
}

export async function createCountryAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome do pais deve ter pelo menos 2 caracteres.");
  }

  await db.insert(countries).values({ name }).onConflictDoNothing();
  revalidateScoutingPaths();
}

export async function updateCountryAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Pais");
  const name = optionalText(formData.get("name"), 120);
  if (!name || name.length < 2) {
    throw new Error("O nome do pais deve ter pelo menos 2 caracteres.");
  }

  await db.update(countries).set({ name }).where(eq(countries.id, id));
  revalidateScoutingPaths();
}

export async function deleteCountryAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Pais");
  await db.delete(countries).where(eq(countries.id, id));
  revalidateScoutingPaths();
}

export async function createPlayerAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 160);
  if (!name || name.length < 2) {
    throw new Error("O nome do jogador deve ter pelo menos 2 caracteres.");
  }

  const photo = await saveImageUpload(formData.get("photoFile"), "players");

  const [createdPlayer] = await db
    .insert(players)
    .values({
      name,
      photo,
      clubId: requiredId(formData.get("clubId"), "Clube"),
      countryId: requiredId(formData.get("countryId"), "Pais"),
      height: optionalInt(formData.get("height")),
      weight: optionalInt(formData.get("weight")),
      agent: optionalText(formData.get("agent"), 160),
      position1Id: requiredId(formData.get("position1Id"), "Posicao principal"),
      position2Id: optionalInt(formData.get("position2Id")),
      position3Id: optionalInt(formData.get("position3Id")),
      goals: optionalInt(formData.get("goals")) ?? 0,
      assists: optionalInt(formData.get("assists")) ?? 0,
    })
    .returning({ id: players.id });

  revalidateScoutingPaths();
  redirect(`/jogadores/${createdPlayer.id}`);
}

export async function updatePlayerAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Jogador");
  const name = optionalText(formData.get("name"), 160);
  if (!name || name.length < 2) {
    throw new Error("O nome do jogador deve ter pelo menos 2 caracteres.");
  }

  const existingPhoto = optionalText(formData.get("existingPhoto"), 2000);
  const uploadedPhoto = await saveImageUpload(formData.get("photoFile"), "players");

  await db
    .update(players)
    .set({
      name,
      photo: uploadedPhoto ?? existingPhoto,
      clubId: requiredId(formData.get("clubId"), "Clube"),
      countryId: requiredId(formData.get("countryId"), "Pais"),
      height: optionalInt(formData.get("height")),
      weight: optionalInt(formData.get("weight")),
      agent: optionalText(formData.get("agent"), 160),
      position1Id: requiredId(formData.get("position1Id"), "Posicao principal"),
      position2Id: optionalInt(formData.get("position2Id")),
      position3Id: optionalInt(formData.get("position3Id")),
      goals: optionalInt(formData.get("goals")) ?? 0,
      assists: optionalInt(formData.get("assists")) ?? 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(players.id, id));

  revalidateScoutingPaths();
  revalidatePath(`/jogadores/${id}`);
}

export async function deletePlayerAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Jogador");
  await db.delete(players).where(eq(players.id, id));
  revalidateScoutingPaths();
  redirect("/jogadores");
}

export async function createReportAction(formData: FormData) {
  const playerId = requiredId(formData.get("playerId"), "Jogador");
  const competitionId = requiredId(formData.get("competitionId"), "Competicao");
  const reportDate = requiredDate(formData.get("reportDate"), "Data");
  const observations = optionalText(formData.get("observations"), 8000);
  const status = parseReportStatus(formData.get("status"));

  const [createdReport] = await db
    .insert(reports)
    .values({
      playerId,
      competitionId,
      reportDate,
      observations,
      status,
    })
    .returning({ id: reports.id });

  const averages = await replaceReportMetrics(createdReport.id, formData);

  await db
    .update(reports)
    .set({
      ...averages,
      status,
    })
    .where(eq(reports.id, createdReport.id));

  revalidateScoutingPaths();
  redirect(`/relatorios/${createdReport.id}`);
}

export async function updateReportAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Relatorio");
  const playerId = requiredId(formData.get("playerId"), "Jogador");
  const competitionId = requiredId(formData.get("competitionId"), "Competicao");
  const reportDate = requiredDate(formData.get("reportDate"), "Data");
  const observations = optionalText(formData.get("observations"), 8000);
  const status = parseReportStatus(formData.get("status"));
  const averages = await replaceReportMetrics(id, formData);

  await db
    .update(reports)
    .set({
      playerId,
      competitionId,
      reportDate,
      observations,
      status,
      ...averages,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(reports.id, id));

  revalidateScoutingPaths();
  revalidatePath(`/relatorios/${id}`);
}

export async function deleteReportAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Relatorio");
  await db.delete(reports).where(eq(reports.id, id));
  revalidateScoutingPaths();
  redirect("/relatorios");
}

export async function createShadowTeamAction(formData: FormData) {
  const name = optionalText(formData.get("name"), 140);
  if (!name || name.length < 2) {
    throw new Error("O nome da equipa sombra deve ter pelo menos 2 caracteres.");
  }

  const [createdTeam] = await db
    .insert(shadowTeams)
    .values({
      name,
      notes: optionalText(formData.get("notes"), 4000),
    })
    .returning({ id: shadowTeams.id });

  revalidateScoutingPaths();
  redirect(`/equipa-sombra/${createdTeam.id}`);
}

export async function updateShadowTeamAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Equipa sombra");
  const name = optionalText(formData.get("name"), 140);
  if (!name || name.length < 2) {
    throw new Error("O nome da equipa sombra deve ter pelo menos 2 caracteres.");
  }

  await db
    .update(shadowTeams)
    .set({
      name,
      notes: optionalText(formData.get("notes"), 4000),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(shadowTeams.id, id));

  revalidateScoutingPaths();
  revalidatePath(`/equipa-sombra/${id}`);
}

export async function deleteShadowTeamAction(formData: FormData) {
  const id = requiredId(formData.get("id"), "Equipa sombra");
  await db.delete(shadowTeams).where(eq(shadowTeams.id, id));
  revalidateScoutingPaths();
  redirect("/equipa-sombra");
}

export async function addShadowTeamPlayerAction(formData: FormData) {
  const shadowTeamId = requiredId(formData.get("shadowTeamId"), "Equipa sombra");
  const playerId = requiredId(formData.get("playerId"), "Jogador");

  await db
    .insert(shadowTeamPlayers)
    .values({ shadowTeamId, playerId })
    .onConflictDoNothing();

  revalidateScoutingPaths();
  revalidatePath(`/equipa-sombra/${shadowTeamId}`);
}

export async function removeShadowTeamPlayerAction(formData: FormData) {
  const shadowTeamId = requiredId(formData.get("shadowTeamId"), "Equipa sombra");
  const playerId = optionalInt(formData.get("playerId"));
  const linkId = optionalInt(formData.get("id"));

  if (playerId) {
    await db
      .delete(shadowTeamPlayers)
      .where(
        and(
          eq(shadowTeamPlayers.shadowTeamId, shadowTeamId),
          eq(shadowTeamPlayers.playerId, playerId),
        ),
      );
  } else if (linkId) {
    await db.delete(shadowTeamPlayers).where(eq(shadowTeamPlayers.id, linkId));
  } else {
    throw new Error("Ligacao invalida.");
  }

  revalidateScoutingPaths();
  revalidatePath(`/equipa-sombra/${shadowTeamId}`);
}
