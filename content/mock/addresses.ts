import type { SavedAddress } from '@/lib/api/schemas/account';

/** Seeded saved addresses (M3.3, issue #7), keyed by userId. */
export const addresses: Record<string, SavedAddress[]> = {
  'u-001': [
    {
      id: 'addr-seed-1',
      recipient: 'Nguyễn Thị Mai',
      phone: '0912345678',
      line1: '12 Le Loi',
      ward: 'Ben Nghe',
      district: 'District 1',
      province: 'Ho Chi Minh City',
      label: 'home',
      isDefault: true,
    },
    {
      id: 'addr-seed-2',
      recipient: 'Nguyễn Thị Mai',
      phone: '0912345678',
      line1: '88 Nguyen Hue',
      ward: 'Ben Thanh',
      district: 'District 1',
      province: 'Ho Chi Minh City',
      label: 'office',
      isDefault: false,
    },
  ],
  'u-002': [
    {
      id: 'addr-seed-3',
      recipient: 'Trần Khánh Linh',
      phone: '0987654321',
      line1: '88 Nguyen Hue',
      ward: 'Ben Thanh',
      district: 'District 1',
      province: 'Ho Chi Minh City',
      label: 'office',
      isDefault: true,
    },
  ],
};
