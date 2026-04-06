import {
  createCountryAction,
  deleteCountryAction,
  updateCountryAction,
} from "@/actions/scouting";
import { SimpleSettingsPage } from "@/components/scouting/simple-settings-page";
import { getCountries } from "@/lib/scouting-data";

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <SimpleSettingsPage
      title="Paises"
      subtitle="Gerir a lista de nacionalidades usada nos perfis dos jogadores."
      createLabel="Criar Pais"
      tableLabel="Paises Registados"
      items={countries}
      createAction={createCountryAction}
      updateAction={updateCountryAction}
      deleteAction={deleteCountryAction}
    />
  );
}
