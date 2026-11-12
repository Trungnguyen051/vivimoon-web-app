'use client';
import { useState } from 'react';
import { MapPin, Pencil, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import type { AddressCreate, SavedAddress } from '@/lib/api/schemas/account';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AddressDict = Dictionary['addresses'];
type FormState = AddressCreate;

const EMPTY_FORM: FormState = {
  recipient: '', phone: '', line1: '', ward: '', district: '', province: '', label: 'home',
};

/**
 * Strips `id`/`isDefault` off a `SavedAddress` before it seeds edit-form
 * state. Without this, a non-default address's `isDefault: false` rides
 * along untouched by any field editor and gets PATCHed back verbatim —
 * `addressPatchSchema` only accepts `isDefault: true` or absent, so editing
 * any non-default address would 400.
 */
function toFormState(address: SavedAddress): FormState {
  const { id: _id, isDefault: _isDefault, ...fields } = address;
  return fields;
}

function AddressForm({
  initial, dict, busy, onSubmit, onCancel, onDelete,
}: {
  initial: FormState; dict: AddressDict; busy: boolean;
  onSubmit: (form: FormState) => void; onCancel: () => void; onDelete?: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    for (const key of ['recipient', 'phone', 'line1', 'ward', 'district', 'province'] as const) {
      if (!form[key].trim()) next[key] = dict.errors.required;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg border p-4">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.recipient) || undefined}>
          <FieldLabel htmlFor="recipient">{dict.recipient}</FieldLabel>
          <Input id="recipient" value={form.recipient} onChange={(e) => set('recipient', e.target.value)} />
          {errors.recipient ? <FieldError>{errors.recipient}</FieldError> : null}
        </Field>
        <Field data-invalid={Boolean(errors.phone) || undefined}>
          <FieldLabel htmlFor="phone">{dict.phone}</FieldLabel>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          {errors.phone ? <FieldError>{errors.phone}</FieldError> : null}
        </Field>
        <Field data-invalid={Boolean(errors.line1) || undefined}>
          <FieldLabel htmlFor="line1">{dict.line1}</FieldLabel>
          <Input id="line1" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
          {errors.line1 ? <FieldError>{errors.line1}</FieldError> : null}
        </Field>
        <Field data-invalid={Boolean(errors.ward) || undefined}>
          <FieldLabel htmlFor="ward">{dict.ward}</FieldLabel>
          <Input id="ward" value={form.ward} onChange={(e) => set('ward', e.target.value)} />
          {errors.ward ? <FieldError>{errors.ward}</FieldError> : null}
        </Field>
        <Field data-invalid={Boolean(errors.district) || undefined}>
          <FieldLabel htmlFor="district">{dict.district}</FieldLabel>
          <Input id="district" value={form.district} onChange={(e) => set('district', e.target.value)} />
          {errors.district ? <FieldError>{errors.district}</FieldError> : null}
        </Field>
        <Field data-invalid={Boolean(errors.province) || undefined}>
          <FieldLabel htmlFor="province">{dict.province}</FieldLabel>
          <Input id="province" value={form.province} onChange={(e) => set('province', e.target.value)} />
          {errors.province ? <FieldError>{errors.province}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="label">{dict.label}</FieldLabel>
          <Select
            value={form.label}
            // Every option here carries a value, so Base UI's nullable `null` cannot
            // arrive — but it is ignored rather than cast into a label.
            onValueChange={(v) => { if (v) set('label', v as FormState['label']); }}
            items={{ home: dict.labels.home, office: dict.labels.office, other: dict.labels.other }}
          >
            <SelectTrigger id="label" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home">{dict.labels.home}</SelectItem>
              <SelectItem value="office">{dict.labels.office}</SelectItem>
              <SelectItem value="other">{dict.labels.other}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{dict.save}</Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>{dict.cancel}</Button>
        {onDelete ? <Button type="button" variant="outline" onClick={onDelete} disabled={busy} className="ml-auto">{dict.delete}</Button> : null}
      </div>
    </form>
  );
}

export function AddressesManager({ initialAddresses, dict }: { initialAddresses: SavedAddress[]; dict: AddressDict }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(form: FormState) {
    setBusy(true);
    setError(null);
    const result = await apiRequest<SavedAddress[]>('/api/account/addresses', { method: 'POST', body: form });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setAddresses(result.data);
    setEditingId(null);
  }

  async function handleEdit(id: string, form: FormState) {
    setBusy(true);
    setError(null);
    const result = await apiRequest<SavedAddress[]>(`/api/account/addresses/${id}`, { method: 'PATCH', body: form });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setAddresses(result.data);
    setEditingId(null);
  }

  async function handleSetDefault(id: string) {
    setBusy(true);
    setError(null);
    const result = await apiRequest<SavedAddress[]>(`/api/account/addresses/${id}`, { method: 'PATCH', body: { isDefault: true } });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setAddresses(result.data);
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    const result = await apiRequest<SavedAddress[]>(`/api/account/addresses/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setAddresses(result.data);
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {addresses.length === 0 && editingId !== 'new' ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><MapPin /></EmptyMedia>
            <EmptyTitle>{dict.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) =>
            editingId === address.id ? (
              <li key={address.id}>
                <AddressForm
                  initial={toFormState(address)} dict={dict} busy={busy}
                  onSubmit={(form) => handleEdit(address.id, form)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(address.id)}
                />
              </li>
            ) : (
              <li key={address.id}>
                <div className="flex flex-col gap-1 rounded-sm border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{address.recipient}</span>
                      {address.isDefault ? <Badge variant="outline" className="rounded-none border-primary text-primary">{dict.default}</Badge> : null}
                    </div>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label={dict.edit} disabled={busy} onClick={() => setEditingId(address.id)}>
                      <Pencil />
                    </Button>
                  </div>
                  <p className="text-sm">{address.phone}</p>
                  <p className="text-sm">
                    {address.line1}, {address.ward}, {address.district}, {address.province}
                  </p>
                  {!address.isDefault ? (
                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => handleSetDefault(address.id)} className="mt-2 self-start">
                      {dict.setDefault}
                    </Button>
                  ) : null}
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {editingId === 'new' ? (
        <AddressForm initial={EMPTY_FORM} dict={dict} busy={busy} onSubmit={handleCreate} onCancel={() => setEditingId(null)} />
      ) : (
        <Button type="button" onClick={() => setEditingId('new')} className="self-start">
          <Plus /> {dict.addNew}
        </Button>
      )}
    </div>
  );
}
