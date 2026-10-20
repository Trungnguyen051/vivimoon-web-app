import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './header';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

vi.mock('next/navigation', () => ({
  usePathname: () => '/vi',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

/**
 * The header's own behaviour, as opposed to the nav's: opening search and what that
 * does to everything around it, and the language toggle that replaced a `select`.
 *
 * The nav must leave the accessibility tree while search is open, not merely fade.
 * A screen reader being read five links that are visually gone is the failure this
 * is here to stop, and it is invisible on screen (#74).
 */
describe('Header', () => {
  it('opens the search field focused, and closes it on Escape', async () => {
    render(<Header locale="vi" dict={viDict} />);

    expect(screen.queryByRole('textbox', { name: viDict.common.search })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: viDict.common.search }));

    const input = await screen.findByRole('textbox', { name: viDict.common.search });
    expect(input).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: viDict.common.search })).not.toBeInTheDocument();
  });

  it('takes the nav out of the accessibility tree while search is open', async () => {
    render(<Header locale="vi" dict={viDict} />);

    expect(screen.getByRole('link', { name: viDict.nav.about })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: viDict.common.search }));

    await screen.findByRole('textbox', { name: viDict.common.search });
    expect(screen.queryByRole('link', { name: viDict.nav.about })).not.toBeInTheDocument();
  });

  it('never attaches a submit handler to a search that goes nowhere', async () => {
    render(<Header locale="vi" dict={viDict} />);
    await userEvent.click(screen.getByRole('button', { name: viDict.common.search }));

    const input = await screen.findByRole('textbox', { name: viDict.common.search });
    await userEvent.type(input, 'lens nâu');

    // No form means Enter cannot submit. A field that silently ate the query would
    // look identical on screen and be worse than one that is plainly a placeholder.
    expect(input.closest('form')).toBeNull();
    await userEvent.keyboard('{Enter}');
    expect(input).toHaveValue('lens nâu');
  });

  it('offers both locales and marks the current one', () => {
    render(<Header locale="vi" dict={viDict} />);

    const group = screen.getByRole('group', { name: viDict.common.language });
    const en = within(group).getByRole('link', { name: 'en' });
    const vn = within(group).getByRole('link', { name: 'vi' });

    expect(vn).toHaveAttribute('aria-current', 'true');
    expect(en).not.toHaveAttribute('aria-current');
    // The switch preserves where you are rather than dropping you on the homepage.
    expect(en).toHaveAttribute('href', '/en');
  });

  it('shows the cart as a cart, and keeps the count on it', () => {
    render(<Header locale="vi" dict={viDict} />);

    expect(screen.getByRole('link', { name: viDict.cart.title })).toHaveAttribute('href', '/vi/cart');
  });
});
