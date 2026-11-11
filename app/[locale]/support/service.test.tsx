import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SupportPage from './page';
import { topicSchema } from '@/lib/api/schemas/support';
import { CONTACT_CHANNELS, contactEmail, contactHotline } from '@/lib/support/contact-channels';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';
import { SEGMENT_ROOT, pathSegments, resolveRoute } from '@/tests/route-tree';

const service = viDict.support.service;

async function renderHub() {
  return render(await SupportPage({ params: Promise.resolve({ locale: 'vi' }) }));
}

const section = (name: string) =>
  screen.getByRole('heading', { name }).closest('section')!;

describe('the Support hub service surface', () => {
  /**
   * Six, not the design's four. Those four were drawn against a four-item taxonomy the
   * spec rejects; against six Topics, four tiles leaves two with no way in from here.
   * Walked from the enum so a seventh Topic cannot be quietly left out.
   */
  it('gives every Topic a tile into the FAQ page', async () => {
    await renderHub();
    const tiles = section(service.topicsTitle);

    expect(within(tiles).getAllByRole('link')).toHaveLength(topicSchema.options.length);
    for (const topic of topicSchema.options) {
      expect(within(tiles).getByRole('link', { name: new RegExp(viDict.support.topics[topic]) }))
        .toHaveAttribute('href', `/vi/support/faq?category=${topic}`);
    }
  });

  /**
   * The same guarantee the nav and the authored links carry, over hrefs this page
   * builds. Nothing type-checks a route string.
   */
  it('points every Topic tile at a route that exists', async () => {
    await renderHub();
    const hrefs = within(section(service.topicsTitle))
      .getAllByRole('link')
      .map((link) => link.getAttribute('href')!);

    const dangling = hrefs.filter(
      (href) => !resolveRoute(SEGMENT_ROOT, pathSegments(href, { stripLocale: true })),
    );
    expect(dangling, `Topic tiles with no route:\n${dangling.join('\n')}`).toEqual([]);
  });

  it('expands a policy in place rather than linking away', async () => {
    await renderHub();
    const policies = section(service.policiesTitle);

    // Buttons, not links: nothing here navigates to a policy page that does not exist.
    expect(within(policies).queryAllByRole('link')).toHaveLength(0);
    const policyIds = Object.keys(service.policies) as (keyof typeof service.policies)[];
    expect(within(policies).getAllByRole('button')).toHaveLength(policyIds.length);
    for (const id of policyIds) {
      expect(
        within(policies).getByRole('button', { name: service.policies[id].title }),
        `policy "${id}" renders nowhere`,
      ).toBeInTheDocument();
    }
    expect(within(policies).getByRole('button', { name: service.policies.returns.title }))
      .toHaveAttribute('aria-expanded', 'false');
    /* `hiddenUntilFound`, as on the FAQ accordion: a collapsed policy stays in the
       document so a crawler indexes it and the reader's own Ctrl+F finds it. */
    expect(within(policies).getByText(service.policies.returns.body)).toBeInTheDocument();
  });

  it('renders the real tracking form, not a teaser', async () => {
    await renderHub();
    const tracking = section(service.trackingTitle);

    expect(within(tracking).getByLabelText(viDict.tracking.code)).toBeInTheDocument();
    expect(within(tracking).getByLabelText(viDict.tracking.identifier)).toBeInTheDocument();
    expect(within(tracking).getByRole('button', { name: viDict.tracking.submit })).toBeInTheDocument();
  });

  it('renders every contact channel from the shared module', async () => {
    await renderHub();
    const contact = section(service.contactTitle);

    expect(within(contact).getAllByRole('link')).toHaveLength(CONTACT_CHANNELS.length);
    for (const channel of CONTACT_CHANNELS) {
      const link = within(contact).getByRole('link', { name: new RegExp(service.channels[channel.id]) });
      expect(link).toHaveAttribute('href', channel.href);
      expect(within(link).getByText(channel.value)).toBeInTheDocument();
    }
  });
});

/**
 * The drift this module exists to end: the footer said `hello@vivimoon.com` and
 * `1900 0000`, the Support design said `vivimoon@gmail.com` and `0909.000.000`, and
 * neither file looked wrong on its own.
 */
describe('contact channels', () => {
  it('builds every tel: and mailto: from the value it displays', () => {
    expect(contactHotline().href).toBe(`tel:${contactHotline().value.replace(/\D/g, '')}`);
    expect(contactEmail().href).toBe(`mailto:${contactEmail().value}`);
  });

  it('gives every channel a value and a real destination', () => {
    for (const channel of CONTACT_CHANNELS) {
      expect(channel.value.trim(), channel.id).not.toBe('');
      /* Shape only. The social handles are placeholders Vivimoon has not confirmed,
         and no test can tell a real `m.me` handle from a guess — asserting `!== '#'`
         over an invented value would look like a guard and check nothing. That one is
         flagged in `contact-channels.ts` for a human instead. */
      expect(channel.href, channel.id).toMatch(/^(tel:|mailto:|https:\/\/)/);
    }
  });
});
