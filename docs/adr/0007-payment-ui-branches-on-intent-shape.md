# Payment UI branches on `PaymentIntent` shape, never on method name

Vivimoon's payment provider isn't finalized; M2 ships exactly three methods (QR Pay, ZaloPay, SePay) with cash-on-delivery deliberately excluded, not guessed at. The checkout UI never switches on a method's `type` for its own rendering logic — it branches only on whether the `PaymentIntent` response carries a `qrCode` or a `redirectUrl`. A `switch (method)` in checkout UI was flagged in review as a regression to reject. Adding a fourth method, or COD later, is a new entry in `lib/payments/methods.ts`, not a UI change.
