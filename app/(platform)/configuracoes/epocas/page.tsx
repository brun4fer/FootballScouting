import {
  createSeasonAction,
  deleteSeasonAction,
  updateSeasonAction,
} from "@/actions/scouting";
import { SimpleSettingsPage } from "@/components/scouting/simple-settings-page";
import { getSeasons } from "@/lib/scouting-data";

export default async function SeasonsPage() {
  const seasons = await getSeasons();

  return (
    <SimpleSettingsPage
      title="Epocas"
      subtitle="Gerir as epocas disponiveis para organizar competicoes e relatórios."
      createLabel="Criar Epoca"
      tableLabel="Epocas Registadas"
      items={seasons}
      createAction={createSeasonAction}
      updateAction={updateSeasonAction}
      deleteAction={deleteSeasonAction}
    />
  );
}
