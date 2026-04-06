import {
  createPositionAction,
  deletePositionAction,
  updatePositionAction,
} from "@/actions/scouting";
import { SimpleSettingsPage } from "@/components/scouting/simple-settings-page";
import { getPositions } from "@/lib/scouting-data";

export default async function PositionsPage() {
  const positions = await getPositions();

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
    />
  );
}
