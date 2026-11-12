# Guest orders earn Held Points, credited when an account verifies the phone

**Status:** accepted. Settled during the buying-flow grill (Figma "Luồng mua hàng", screens 06 and 09).

Until now Loyalty only existed on accounts, so a guest order earned nothing. The wireframe tells a guest "Đơn này tích 58 điểm · giữ theo SĐT của bạn" at checkout. On success it says "Bạn vừa tích 58 điểm… Điểm đang được giữ theo SĐT", with buttons to create an account. Converting guests into members is the point of both screens.

We considered:
- Showing the number as a teaser with nothing behind it. That is a promise the system would not keep.
- Silently creating an account at checkout from the pre-ticked "Tạo tài khoản bằng SĐT này" box. That makes an account without a verified phone or the shopper's explicit action.

We chose to keep a guest order's points as **Held Points** against its phone number. When an account verifies that phone, they are credited to that account. Sign-up already requires phone verification (ADR-0021), so verifying the phone is what proves ownership of the points. The checkout box only chooses which path the success page highlights; it never creates an account by itself.

## Consequences

- Held Points can't be spent until they are credited.
- A phone number typed by someone who doesn't own it never pays out, because that person can't pass verification.
- The earn rule is still provisional (see Loyalty). The amount a guest is shown has to come from the same rule the server credits with.
