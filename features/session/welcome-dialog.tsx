'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { AccountPatch } from '@/lib/api/schemas/account';
import type { User } from '@/lib/api/schemas/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { sphSteps } from '@/lib/products/rx-ranges';
import { useSessionStore } from './session-store';

// Default Rx is myopia only: the stocked sph steps at or below 0, ascending.
const STEPS = sphSteps().filter((v) => v <= 0);

const GENDERS = ['male', 'female', 'other'] as const;

export function Stepper({ label, value, onChange, dict }: { label: string; value: number; onChange: (v: number) => void; dict: Dictionary['welcome'] }) {
  const i = Math.max(0, STEPS.findLastIndex((s) => s <= value));
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" aria-label={`${dict.increase} ${label}`} disabled={i >= STEPS.length - 1} onClick={() => onChange(STEPS[i + 1])}><Plus /></Button>
        <output aria-label={label} className="w-14 text-center tabular-nums">{value.toFixed(2)}</output>
        <Button type="button" variant="outline" size="icon" aria-label={`${dict.decrease} ${label}`} disabled={i === 0} onClick={() => onChange(STEPS[i - 1])}><Minus /></Button>
      </div>
    </div>
  );
}

/** Opens for any signed-in user without `onboardedAt` — a first Google/Apple sign-in included. */
export function WelcomeDialog({ dict }: { dict: Dictionary['welcome'] }) {
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<(typeof GENDERS)[number] | ''>('');
  const [rx, setRx] = useState({ left: 0, right: 0 });
  const [rxTouched, setRxTouched] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(patch: AccountPatch) {
    setSaving(true);
    setError(false);
    const result = await apiRequest<User>('/api/account', { method: 'PATCH', body: { ...patch, onboardedAt: new Date().toISOString() } });
    setSaving(false);
    if (!result.ok) return setError(true);
    setUser(result.data);
  }

  const done = () => save({ ...(dob && { dob }), ...(gender && { gender }), ...(rxTouched && { defaultRx: rx }) });

  return (
    <Dialog open={!!user && !user.onboardedAt}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-lg uppercase">{dict.title}</DialogTitle>
          <DialogDescription>{dict.subtitle}</DialogDescription>
        </DialogHeader>
        <label className="grid gap-1.5 text-sm">
          {dict.dob}
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </label>
        <fieldset className="flex gap-4 text-sm">
          <legend className="mb-1.5">{dict.gender}</legend>
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-1.5">
              <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
              {dict[g]}
            </label>
          ))}
        </fieldset>
        <div className="flex gap-4" role="group" aria-label={dict.defaultRx}>
          <Stepper label={dict.leftEye} value={rx.left} onChange={(left) => { setRxTouched(true); setRx({ ...rx, left }); }} dict={dict} />
          <Stepper label={dict.rightEye} value={rx.right} onChange={(right) => { setRxTouched(true); setRx({ ...rx, right }); }} dict={dict} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{dict.error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" disabled={saving} onClick={() => save({})}>{dict.skip}</Button>
          <Button type="button" className="flex-[2]" disabled={saving} onClick={done}>{dict.done}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
