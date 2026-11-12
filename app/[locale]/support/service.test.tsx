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

  it('renders every contact channel from the shared module, as text', async () => {
    await renderHub();
    const contact = section(service.contactTitle);

    for (const channel of CONTACT_CHANNELS) {
      expect(within(contact).getByText(service.channels[channel.id])).toBeInTheDocument();
      expect(within(contact).getByText(channel.value)).toBeInTheDocument();
    }

    /* Nothing here navigates (#158). Every value is placeholder wireframe copy, and an
       invented handle rendered as a working link lands a shopper on a "page not found"
       while looking finished. The day Vivimoon sends the real ones, this is the test
       that has to be changed on purpose. */
    expect(within(contact).queryAllByRole('link')).toHaveLength(0);
  });
});

/**
 * The drift this module exists to end: the footer said `hello@vivimoon.com` and
 * `1900 0000`, the Support design said `vivimoon@gmail.com` and `0909.000.000`, and
 * neither file looked wrong on its own.
 */
describe('contact channels', () => {
  it('gives the footer the same hotline and email the hub shows', () => {
    expect(CONTACT_CHANNELS).toContain(contactHotline());
    expect(CONTACT_CHANNELS).toContain(contactEmail());
  });

  it('gives every channel a value', () => {
    for (const channel of CONTACT_CHANNELS) {
      expect(channel.value.trim(), channel.id).not.toBe('');
    }
  });

  /**
   * The module carries no destinations at all (#158) — not a `#`, not an invented
   * handle, not a `tel:` built from a placeholder number. Held as a shape rather than
   * left to review: an `href` added back here would quietly make every surface above
   * navigable again, and the first thing anyone would notice is a shopper landing
   * nowhere.
   */
  it('carries no hrefs while the values are placeholders', () => {
    for (const channel of CONTACT_CHANNELS) {
      expect(Object.keys(channel), channel.id).toEqual(['id', 'value']);
    }
  });
});
