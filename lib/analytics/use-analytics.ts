'use client';
import { track } from './analytics';

export function useAnalytics() {
  return { track };
}
