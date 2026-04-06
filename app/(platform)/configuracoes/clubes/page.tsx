import { createClubAction, deleteClubAction, updateClubAction } from "@/actions/scouting";
import { SimpleSettingsPage } from "@/components/scouting/simple-settings-page";
import { getClubs } from "@/lib/scouting-data";

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <SimpleSettingsPage
      title="Clubes"
      subtitle="Manter o catalogo de clubes para associacao direta aos jogadores observados."
      createLabel="Criar Clube"
      tableLabel="Clubes Registados"
      items={clubs}
      createAction={createClubAction}
      updateAction={updateClubAction}
      deleteAction={deleteClubAction}
    />
  );
}
