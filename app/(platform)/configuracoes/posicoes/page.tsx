import {
  createPositionAction,
  deletePositionAction,
  updatePositionAction,
} from "@/actions/scouting";
import { SimpleSettingsPage } from "@/components/scouting/simple-settings-page";
import { getPositionsWithUsage } from "@/lib/scouting-data";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PositionsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const positions = await getPositionsWithUsage();
  const positionName =
    typeof params.positionName === "string" && params.positionName.trim().length > 0
      ? params.positionName
      : "Esta posicao";
  const notice =
    params.error === "position-in-use"
      ? {
          tone: "error" as const,
          title: "Posicao em uso",
          description: `${positionName} nao pode ser eliminada porque ainda esta atribuida a um ou mais jogadores. Remova ou altere primeiro essas fichas.`,
        }
      : undefined;

  return (
    <SimpleSettingsPage
      title="Posicoes"
      subtitle="Definir a ordem e o catalogo de posicoes usadas no perfil e nas consultas."
      createLabel="Criar Posicao"
      tableLabel="Posicoes Registadas"
      items={positions}
      createAction={createPositionAction}
      updateAction={updatePositionAction}
      deleteAction={deletePositionAction}
      includeDisplayOrder
      notice={notice}
    />
  );
}
