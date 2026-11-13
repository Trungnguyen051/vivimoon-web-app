'use client';
import type { SavedAddress } from '@/lib/api/schemas/account';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { RadioCard } from '@/components/commerce/radio-card';

/**
 * A member's saved Addresses as radio cards (Figma 58:251): the chosen one is what
 * the order ships to. `editing` swaps that card for `form`, the inline editor the
 * caller owns; `editing === 'new'` puts the form under the cards instead of
 * "+ Thêm địa chỉ mới".
 */
export function AddressCards({
  addresses, selectedId, onSelect, editing, onEdit, onAdd, form, dict,
}: {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (address: SavedAddress) => void;
  editing: string | null;
  onEdit: (address: SavedAddress) => void;
  onAdd: () => void;
  form: React.ReactNode;
  dict: Dictionary;
}) {
  const t = dict.checkout.address;
  const labels = dict.addresses.labels;
  return (
    <div className="flex flex-col gap-3">
      {addresses.length > 0 ? (
        <div role="radiogroup" aria-label={t.title} className="flex flex-col gap-3">
          {addresses.map((a) =>
            editing === a.id ? (
              <div key={a.id}>{form}</div>
            ) : (
              <RadioCard
                key={a.id}
                name="address"
                value={a.id}
                checked={selectedId === a.id}
                onChange={() => onSelect(a)}
                title={(
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {a.recipient} · {a.phone}
                    {a.isDefault ? <span className="bg-foreground px-2 py-0.5 text-xs font-normal text-background">{t.default}</span> : null}
                  </span>
                )}
                trailing={(
                  <button
                    type="button" onClick={() => onEdit(a)} aria-label={`${t.edit}: ${a.line1}`}
                    className="shrink-0 text-sm underline underline-offset-4"
                  >
                    {t.edit}
                  </button>
                )}
              >
                <span className="text-sm text-muted-foreground">
                  {a.line1}, {a.ward}, {a.district}, {a.province}
                  {a.label !== 'home' ? ` (${labels[a.label]})` : null}
                </span>
              </RadioCard>
            ),
          )}
        </div>
      ) : null}
      {editing === 'new' ? form : (
        <button type="button" onClick={onAdd} className="w-fit text-sm font-medium underline underline-offset-4">
          {t.add}
        </button>
      )}
    </div>
  );
}
