export function formatPrice(
  amount: number,
  currency: 'VND' | 'USD',
  locale: 'en' | 'vi',
): string {
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}
