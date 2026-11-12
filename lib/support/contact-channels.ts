/**
 * How a shopper reaches a person, in one place (#122).
 *
 * PROVISIONAL — owner: Vivimoon. Every value here is placeholder wireframe copy: the
 * email and phone are the Support design's, and the two social names are invented.
 *
 * It exists because two surfaces had already drifted apart. The footer carried
 * `hello@vivimoon.com` and hotline `1900 0000`; the Support design says
 * `vivimoon@gmail.com` and `0909.000.000`. Nothing was wrong with either file on its
 * own, which is exactly why it went unnoticed — and why the hub was about to add a
 * third copy. The design's values win, and both surfaces read them from here so the
 * question cannot be answered twice again.
 *
 * **No hrefs, deliberately (#158).** This storefront is a wireframe against Vivimoon's
 * real content, and a channel is text until Vivimoon supplies the real one. An invented
 * `m.me/vivimoon` renders as a working link and lands a shopper on a "page not found",
 * which is worse than plain text in the one way that matters: it looks finished. A
 * `tel:` or `mailto:` built from a placeholder number is the same mistake wearing a
 * protocol. When the real details arrive, adding an `href` here is a smaller change
 * than discovering which of these ever worked.
 *
 * Labels are not here: a channel's name is UI copy and belongs in the dictionary with
 * the parity the `Dictionary` type gives it. This module owns the values a reader sees.
 */
export type ContactChannelId = 'hotline' | 'email' | 'facebook' | 'instagram';

export type ContactChannel = {
  id: ContactChannelId;
  /** What a reader sees — a number, an address or a handle, not a translated word. */
  value: string;
};

const HOTLINE = '0909.000.000';
const EMAIL = 'vivimoon@gmail.com';

/**
 * Keyed, so every channel is proven present at compile time. The footer reads two of
 * these by name on every page of the site; found by `.find(...)!` over an array, a
 * renamed or deleted entry would type-check and then throw on `undefined.value` in the
 * footer — which is to say everywhere.
 */
const CHANNELS: Record<ContactChannelId, ContactChannel> = {
  hotline: { id: 'hotline', value: HOTLINE },
  email: { id: 'email', value: EMAIL },
  facebook: { id: 'facebook', value: 'Vivimoon' },
  instagram: { id: 'instagram', value: '@vivimoon' },
};

/** The order the hub draws them in. */
export const CONTACT_CHANNELS: ContactChannel[] = [
  CHANNELS.hotline, CHANNELS.email, CHANNELS.facebook, CHANNELS.instagram,
];

/** The two the footer shows, read from the same place the hub renders. */
export const contactHotline = () => CHANNELS.hotline;
export const contactEmail = () => CHANNELS.email;
