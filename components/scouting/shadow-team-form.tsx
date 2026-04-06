import { FormField } from "@/components/scouting/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ShadowTeamValues = {
  id?: number;
  name?: string | null;
  notes?: string | null;
};

export function ShadowTeamForm({
  action,
  submitLabel,
  values,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: ShadowTeamValues;
}) {
  return (
    <form action={action} className="grid gap-4">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <FormField label="Nome" htmlFor="name">
        <Input id="name" name="name" defaultValue={values?.name ?? ""} required minLength={2} />
      </FormField>

      <FormField label="Notas" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={5} defaultValue={values?.notes ?? ""} />
      </FormField>

      <div>
        <Button>{submitLabel}</Button>
      </div>
    </form>
  );
}
