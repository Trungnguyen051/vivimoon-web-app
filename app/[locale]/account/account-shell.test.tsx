import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountShell } from './account-shell';

let path = '/en/account';
vi.mock('next/navigation', () => ({ usePathname: () => path }));

const dict = { accountInfo: 'Account info', orders: 'Order history', favorites: 'Favorites', addresses: 'Saved addresses', backToAccount: 'Account' };
const shell = () => render(
  <AccountShell locale="en" name="Mai" memberSince="Member since Jan 15, 2026" orderCount={10} dict={dict}><p>content</p></AccountShell>,
);

describe('AccountShell', () => {
  it('shows name, member date, the four rows and the order count', () => {
    path = '/en/account';
    shell();
    expect(screen.getByText('Mai')).toBeInTheDocument();
    expect(screen.getByText('Member since Jan 15, 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Account info/ })).toHaveAttribute('aria-current', 'page');
  });

  it('highlights the matching row on a sub-page, which also gets a back link', () => {
    path = '/en/account/orders/o-1';
    shell();
    expect(screen.getByRole('link', { name: /Order history/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Account info/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/en/account');
  });
});
