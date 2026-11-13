/**
 * Where the order confirmation went, shown on the success page without spelling out
 * the whole contact (#206): "0912 *** 678", "m***@example.vn".
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.length < 8) return '***';
  return `${digits.slice(0, 4)} *** ${digits.slice(-3)}`;
}

export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return '***';
  return `${email[0]}***${email.slice(at)}`;
}
