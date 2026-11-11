/**
 * How a shopper reaches a person, in one place (#122).
 *
 * PROVISIONAL — owner: Vivimoon. The social links are placeholders and the hotline
 * hours are invented; the email and phone are the design's.
 *
 * It exists because two surfaces had already drifted apart. The footer carried
 * `hello@vivimoon.com` and hotline `1900 0000`; the Support design says
 * `vivimoon@gmail.com` and `0909.000.000`. Nothing was wrong with either file on its
 * own, which is exactly why it went unnoticed — and why the hub was about to add a
 * third copy. The design's values win, and both surfaces read them from here so the
 * question cannot be answered twice again.
 *
 * Labels are not here: a channel's name is UI copy and belongs in the dictionary with
 * the parity the `Dictionary` type gives it. This module owns the values a reader
 * dials, mails or opens.
 */
export type ContactChannelId = 'hotline' | 'email' | 'messenger' | 'zalo';

export type ContactChannel = {
  id: ContactChannelId;
  /** What a reader sees — a number or an address, not a translated word. */
  value: string;
  /** Where it goes. `tel:` and `mailto:` are built from the value, so they cannot disagree with it. */
  href: string;
};

const HOTLINE = '0909.000.000';
const EMAIL = 'vivimoon@gmail.com';

/**
 * Keyed, so every channel is proven present at compile time. The footer reads two of
 * these by name on every page of the site; found by `.find(...)!` over an array, a
 * renamed or deleted entry would type-check and then throw on `undefined.href` in the
 * footer — which is to say everywhere.
 */
const CHANNELS: Record<ContactChannelId, ContactChannel> = {
  // `tel:` wants the digits only — the dots are for reading, not for dialling.
  hotline: { id: 'hotline', value: HOTLINE, href: `tel:${HOTLINE.replace(/\D/g, '')}` },
  email: { id: 'email', value: EMAIL, href: `mailto:${EMAIL}` },
  /*
   * PLACEHOLDER handles — owner: Vivimoon, and these must be replaced before launch.
   * They point at the real platforms rather than at `#`, so nothing renders as a link
   * to nowhere, but `m.me/vivimoon` and `zalo.me/vivimoon` are guesses: until Vivimoon
   * confirms them, two of the four tiles may land a shopper on a "page not found".
   * No test can catch that — the handle is either real or it is not, and only Vivimoon
   * knows which.
   */
  messenger: { id: 'messenger', value: 'Vivimoon', href: 'https://m.me/vivimoon' },
  zalo: { id: 'zalo', value: 'Vivimoon', href: 'https://zalo.me/vivimoon' },
};

/** The order the hub draws them in. */
export const CONTACT_CHANNELS: ContactChannel[] = [
  CHANNELS.hotline, CHANNELS.email, CHANNELS.messenger, CHANNELS.zalo,
];

/** The two the footer shows, read from the same place the hub renders. */
export const contactHotline = () => CHANNELS.hotline;
export const contactEmail = () => CHANNELS.email;
