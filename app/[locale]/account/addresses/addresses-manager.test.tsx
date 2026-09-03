import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { SavedAddress } from '@/lib/api/schemas/account';
import { AddressesManager } from './addresses-manager';

const dict = getDictionary('en').addresses;

const NON_DEFAULT: SavedAddress = {
  id: 'addr-1', recipient: 'Mai', phone: '0912345678', line1: '88 Nguyen Hue',
  ward: 'Ben Thanh', district: 'District 1', province: 'Ho Chi Minh City', label: 'office',
  isDefault: false,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('AddressesManager — editing an existing address', () => {
  it("PATCHes only address fields, never the non-default address's own isDefault:false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true, data: [NON_DEFAULT] }));
    vi.stubGlobal('fetch', fetchMock);
    render(<AddressesManager initialAddresses={[NON_DEFAULT]} dict={dict} />);

    await userEvent.click(screen.getByRole('button', { name: dict.edit }));
    await userEvent.click(screen.getByRole('button', { name: dict.save }));

    expect(fetchMock).toHaveBeenCalled();
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/account/addresses/addr-1');
    const body = JSON.parse(init.body);
    expect(body).not.toHaveProperty('isDefault');
    expect(body).not.toHaveProperty('id');
  });
});
