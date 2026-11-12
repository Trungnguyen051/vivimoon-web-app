'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { apiRequest, type ApiResult } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import { Stepper } from '@/features/session/welcome-dialog';
import type { User } from '@/lib/api/schemas/auth';
import type { AccountPatch } from '@/lib/api/schemas/account';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const GENDERS = ['male', 'female', 'other'] as const;

const dash = '—';
const fmtRx = (v: number) => (v === 0 ? '0' : v.toFixed(2).replace('-', '−'));
const fmtDob = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : dash);

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-3 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Section({ title, editLabel, onEdit, children }: { title: string; editLabel: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <Button type="button" variant="ghost" size="icon" aria-label={`${editLabel} ${title}`} onClick={onEdit}><Pencil /></Button>
      </div>
      {children}
    </section>
  );
}

export function AccountInfo({ user, locale, dict, welcome }: { user: User; locale: string; dict: Dictionary['account']; welcome: Dictionary['welcome'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const clear = useSessionStore((s) => s.clear);
  const [current, setCurrent] = useState(user);
  const [editing, setEditing] = useState<'personal' | 'account' | null>(null);
  const [form, setForm] = useState({ name: '', gender: '', dob: '', email: '', left: 0, right: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);

  function edit(section: 'personal' | 'account') {
    setError(null);
    setForm({
      name: current.name, gender: current.gender ?? '', dob: current.dob ?? '', email: current.email ?? '',
      left: current.defaultRx?.left ?? 0, right: current.defaultRx?.right ?? 0,
    });
    setEditing(section);
  }

  async function patch(body: AccountPatch): Promise<boolean> {
    setBusy(true);
    const result = await apiRequest<User>('/api/account', { method: 'PATCH', body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    setCurrent(result.data);
    setUser(result.data);
    return true;
  }

  async function savePersonal() {
    if (!form.name.trim()) return setError(dict.errors.name);
    const body: AccountPatch = { name: form.name.trim() };
    // An untouched 0/0 must not turn into a saved Default Rx.
    if (current.defaultRx || form.left || form.right) body.defaultRx = { left: form.left, right: form.right };
    if (form.gender) body.gender = form.gender as (typeof GENDERS)[number];
    if (form.dob) body.dob = form.dob;
    if (await patch(body)) setEditing(null);
  }

  async function saveAccount() {
    if (!form.email) return setEditing(null);
    if (await patch({ email: form.email })) setEditing(null);
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const hasPassword = current.hasPassword !== false;
    if (pw.next.length < 8) return setPwError(dict.errors.password);
    if (hasPassword && !pw.current) return setPwError(dict.errors.currentPassword);
    setPwError(null);
    setBusy(true);
    const result = await apiRequest<User>('/api/account', {
      method: 'PATCH',
      body: { password: pw.next, ...(hasPassword && { currentPassword: pw.current }) },
    });
    setBusy(false);
    if (!result.ok) return setPwError(result.error.message);
    setCurrent(result.data);
    setUser(result.data);
    setPw({ current: '', next: '' });
    setPwOpen(false);
  }

  async function leave(request: () => Promise<ApiResult<unknown>>) {
    setBusy(true);
    const result = await request();
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    clear();
    router.push(`/${locale}`);
    router.refresh();
  }
  const signOut = () => leave(() => apiRequest('/api/auth/logout', { method: 'POST' }));
  const deleteAccount = () => leave(() => apiRequest('/api/account', { method: 'DELETE' }));

  const actions = (save: () => void) => (
    <div className="flex gap-3">
      <Button type="button" variant="outline" className="flex-1" onClick={() => setEditing(null)}>{dict.cancel}</Button>
      <Button type="button" className="flex-1" disabled={busy} onClick={save}>{dict.save}</Button>
    </div>
  );
  const errorAlert = error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold uppercase tracking-wide">{dict.accountInfo}</h2>

      <Section title={dict.personalInfo} editLabel={dict.edit} onEdit={() => edit('personal')}>
        {editing === 'personal' ? (
          <div className="flex flex-col gap-4">
            {errorAlert}
            <label className="grid gap-1.5 text-sm">
              {dict.name}
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <fieldset className="flex gap-4 text-sm">
              <legend className="mb-1.5">{dict.gender}</legend>
              {GENDERS.map((g) => (
                <label key={g} className="flex items-center gap-1.5">
                  <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => setForm({ ...form, gender: g })} />
                  {welcome[g]}
                </label>
              ))}
            </fieldset>
            <label className="grid gap-1.5 text-sm">
              {dict.dob}
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </label>
            <div className="flex gap-4" role="group" aria-label={welcome.defaultRx}>
              <Stepper label={welcome.rightEye} value={form.right} onChange={(right) => setForm({ ...form, right })} dict={welcome} />
              <Stepper label={welcome.leftEye} value={form.left} onChange={(left) => setForm({ ...form, left })} dict={welcome} />
            </div>
            {actions(savePersonal)}
          </div>
        ) : (
          <dl>
            <Row label={dict.name} value={current.name || dash} />
            <Row label={dict.gender} value={current.gender ? welcome[current.gender] : dash} />
            <Row label={dict.dob} value={fmtDob(current.dob)} />
            <Row label={welcome.rightEye} value={current.defaultRx ? fmtRx(current.defaultRx.right) : dash} />
            <Row label={welcome.leftEye} value={current.defaultRx ? fmtRx(current.defaultRx.left) : dash} />
          </dl>
        )}
      </Section>

      <Section title={dict.accountInfo} editLabel={dict.edit} onEdit={() => edit('account')}>
        {editing === 'account' ? (
          <div className="flex flex-col gap-4">
            {errorAlert}
            <label className="grid gap-1.5 text-sm">
              {dict.email}
              <Input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            {actions(saveAccount)}
          </div>
        ) : (
          <dl>
            <Row label={dict.phone} value={current.phone || dash} />
            {current.email && <Row label={dict.email} value={current.email} />}
          </dl>
        )}
      </Section>

      {editing === null && errorAlert}
      <Button type="button" size="xl" className="w-full" onClick={() => { setPwError(null); setPw({ current: '', next: '' }); setPwOpen(true); }}>{dict.changePassword}</Button>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" disabled={busy} onClick={signOut}>{dict.signOut}</Button>
        <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={() => setDelOpen(true)}>{dict.deleteAccount}</Button>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{dict.changePassword}</DialogTitle></DialogHeader>
          <form onSubmit={changePassword} noValidate className="flex flex-col gap-4">
            {pwError && <p role="alert" className="text-sm text-destructive">{pwError}</p>}
            {current.hasPassword !== false && (
              <label className="grid gap-1.5 text-sm">
                {dict.currentPassword}
                <Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </label>
            )}
            <label className="grid gap-1.5 text-sm">
              {dict.newPassword}
              <Input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </label>
            <Button type="submit" disabled={busy}>{dict.save}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dict.deleteTitle}</DialogTitle>
            <DialogDescription>{dict.deleteBody}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setDelOpen(false)}>{dict.cancel}</Button>
            <Button type="button" variant="destructive" className="flex-1" disabled={busy} onClick={deleteAccount}>{dict.deleteAccount}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
