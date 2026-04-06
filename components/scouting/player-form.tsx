import { ImageUploadPreview } from "@/components/forms/image-upload-preview";
import { FormField } from "@/components/scouting/form-field";
import { SelectInput } from "@/components/scouting/select-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Option = {
  id: number;
  name: string;
};

type PlayerFormValues = {
  id?: number;
  name?: string | null;
  photo?: string | null;
  clubId?: number;
  countryId?: number;
  height?: number | null;
  weight?: number | null;
  agent?: string | null;
  position1Id?: number;
  position2Id?: number | null;
  position3Id?: number | null;
  goals?: number | null;
  assists?: number | null;
};

export function PlayerForm({
  action,
  submitLabel,
  clubs,
  countries,
  positions,
  values,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  clubs: Option[];
  countries: Option[];
  positions: Option[];
  values?: PlayerFormValues;
}) {
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {values?.photo ? <input type="hidden" name="existingPhoto" value={values.photo} /> : null}

      <FormField label="Nome" htmlFor="name">
        <Input id="name" name="name" defaultValue={values?.name ?? ""} required minLength={2} />
      </FormField>

      <FormField label="Clube" htmlFor="clubId">
        <SelectInput id="clubId" name="clubId" defaultValue={String(values?.clubId ?? "")} required>
          <option value="" disabled>
            Selecionar clube
          </option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Nacionalidade" htmlFor="countryId">
        <SelectInput
          id="countryId"
          name="countryId"
          defaultValue={String(values?.countryId ?? "")}
          required
        >
          <option value="" disabled>
            Selecionar pais
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Posicao 1" htmlFor="position1Id">
        <SelectInput
          id="position1Id"
          name="position1Id"
          defaultValue={String(values?.position1Id ?? "")}
          required
        >
          <option value="" disabled>
            Selecionar posicao
          </option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Posicao 2" htmlFor="position2Id">
        <SelectInput id="position2Id" name="position2Id" defaultValue={String(values?.position2Id ?? "")}>
          <option value="">Sem posicao secundaria</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Posicao 3" htmlFor="position3Id">
        <SelectInput id="position3Id" name="position3Id" defaultValue={String(values?.position3Id ?? "")}>
          <option value="">Sem terceira posicao</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Altura (cm)" htmlFor="height">
        <Input id="height" name="height" type="number" min={0} defaultValue={values?.height ?? undefined} />
      </FormField>

      <FormField label="Peso (kg)" htmlFor="weight">
        <Input id="weight" name="weight" type="number" min={0} defaultValue={values?.weight ?? undefined} />
      </FormField>

      <FormField label="Agente" htmlFor="agent">
        <Input id="agent" name="agent" defaultValue={values?.agent ?? ""} />
      </FormField>

      <FormField label="Golos" htmlFor="goals">
        <Input id="goals" name="goals" type="number" min={0} defaultValue={values?.goals ?? 0} />
      </FormField>

      <FormField label="Assistencias" htmlFor="assists">
        <Input
          id="assists"
          name="assists"
          type="number"
          min={0}
          defaultValue={values?.assists ?? 0}
        />
      </FormField>

      <div className="space-y-2">
        <ImageUploadPreview
          id={values?.id ? `photoFile-${values.id}` : "photoFile"}
          name="photoFile"
          label="Foto"
          defaultImageUrl={values?.photo ?? undefined}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-4">
        <Button>{submitLabel}</Button>
      </div>
    </form>
  );
}
