/**
 * The account a QR transfer pays into (#205), shown beside the VietQR.
 *
 * PROVISIONAL — owner: Vivimoon. These are the wireframe's placeholder details, not a
 * real account; replace them with Vivimoon's own before taking a real transfer.
 */
export const BANK_TRANSFER = {
  bank: 'Vietcombank',
  // Digits only, as a banking app takes it; the page groups it for reading.
  accountNumber: '0011002345678',
  accountHolder: 'CONG TY TNHH VIVIMOON',
} as const;

/** "0011002345678" → "0011 0023 45678", the way the wireframe reads it. */
export const formatAccountNumber = (n: string): string => n.replace(/^(\d{4})(\d{4})/, '$1 $2 ');
