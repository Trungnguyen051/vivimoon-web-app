export function toIntlLocale(locale: 'en' | 'vi'): string {
  return locale === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatPrice(
  amount: number,
  currency: 'VND' | 'USD',
  locale: 'en' | 'vi',
): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}
