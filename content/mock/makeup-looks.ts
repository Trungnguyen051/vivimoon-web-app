import type { MakeupLook } from '@/lib/api/schemas/editorial';

/**
 * PROVISIONAL — the poster frames are the homepage's makeup imagery, reused until
 * Vivimoon shoots looks of its own, and the lens worn in each is a plausible pairing
 * rather than one a stylist chose. The titles are written to read like captions, not
 * supplied copy. Replacing any of it is a data edit in this one file.
 *
 * Four, because that is what the design's band draws and the band shows every Look there
 * is — there is no "view all" behind it to hold a fifth.
 *
 * These live beside the Article fixtures rather than in the dictionary because they are
 * content: a Look's title is authored per locale the way an Article's is, and `CONTEXT.md`
 * already makes that argument for Article.
 *
 * The concept is a short portrait clip. No footage exists, so each is a still that opens
 * the lens it wears, with no play control at all — a control that plays nothing
 * misrepresents the content more than a still does. That is the first thing to revisit
 * when real video arrives.
 */
export const makeupLooks: MakeupLook[] = [
  {
    id: 'natural-everyday',
    image: '/images/makeup-natural.jpg',
    title: {
      vi: 'Makeup trong veo đi học, đi làm',
      en: 'A clean everyday face for class or the office',
    },
    lensName: 'Aqua Daily Clear',
    productSlug: 'aqua-daily-clear',
  },
  {
    id: 'peach-date',
    image: '/images/makeup-pink.jpg',
    title: {
      vi: 'Tông hồng đào cho buổi hẹn',
      en: 'Peach tones for a date',
    },
    lensName: 'Mystic Daily Colored',
    productSlug: 'mystic-daily-colored',
  },
  {
    id: 'warm-orange',
    image: '/images/makeup-orange.jpg',
    title: {
      vi: 'Mắt cam đất, nắng lên là hợp',
      en: 'Warm terracotta eyes for bright days',
    },
    lensName: 'Hazel Monthly Colored',
    productSlug: 'hazel-monthly-colored',
  },
  {
    id: 'smoky-night',
    image: '/images/makeup-smoky.jpg',
    title: {
      vi: 'Smoky sắc lạnh cho buổi tối',
      en: 'A cool smoky eye for the evening',
    },
    lensName: 'Onyx Monthly Colored',
    productSlug: 'onyx-monthly-colored',
  },
];
