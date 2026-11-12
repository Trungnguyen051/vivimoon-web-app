# Checkout offers QR transfer, cash on delivery and e-wallet; email becomes optional

**Status:** accepted. It reverses the M2 note in `lib/payments/methods.ts` that left out cash on delivery. Settled during the buying-flow grill (Figma "Luồng mua hàng", screens 06–08).

M2 shipped three methods: `qr`, `zalopay` and `sepay`. Cash on delivery was left out on purpose and marked provisional. The wireframe offers three different choices: **Chuyển khoản / Quét mã QR**, **Thanh toán khi nhận hàng (COD)** and one **Ví điện tử (MoMo, ZaloPay, VNPay)** row. The QR page also has an "Đổi sang COD" escape hatch. COD is how many Vietnamese shoppers expect to pay. SePay is a bank-transfer QR gateway, so it duplicates the QR row.

We chose:
- **QR:** opens a dedicated payment page that shows the existing intent's `qrCode` (ADR-0007), the bank account details and a 15-minute hold.
- **COD:** places the order with no payment intent.
- **E-wallet:** keeps the existing redirect intent.
- **SePay:** leaves the picker.

The same screens make **email optional**. The order confirmation goes through the shopper's chosen notification channel (Zalo, SMS or email), which is stored on the order.

## Consequences

- An order can now be unpaid at placement (COD) or awaiting a transfer (QR). Its status and the success page's timeline have to reflect that.
- ADR-0022's note that "checkout still collects an email" no longer holds. A guest without an email gets the Order Code on screen and through their chosen channel.
