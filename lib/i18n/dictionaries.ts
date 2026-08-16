import type { Locale } from './config';
import { en, type Dictionary } from './dictionaries/en';
import { vi } from './dictionaries/vi';

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
