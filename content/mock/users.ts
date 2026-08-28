import type { User } from '@/lib/api/schemas/auth';

/** Mock accounts. `password` is plaintext because nothing here is real. */
export interface MockUser extends User {
  password?: string;
}

export const users: MockUser[] = [
  {
    id: 'u-001',
    phone: '0912345678',
    email: 'mai@example.vn',
    name: 'Nguyễn Thị Mai',
    dob: '1998-04-12',
    createdAt: '2026-01-15T09:00:00.000Z',
    password: 'vivimoon123',
  },
  {
    id: 'u-002',
    phone: '0987654321',
    email: 'linh@example.vn',
    name: 'Trần Khánh Linh',
    createdAt: '2026-03-02T14:30:00.000Z',
    password: 'vivimoon123',
  },
];
