# Guest orders join the account that verifies their phone

**Status:** accepted. Settled during the reviews grill (#191).

Only a member can write a Review, and only about a delivered order line they bought. Most first-time buyers check out as guests, then sign up later. Until now their guest orders stayed guest orders, reachable only by Order Code (ADR-0022), so a guest who signed up could never review what they had bought. Their Held Points already move to the account when its phone is verified (ADR-0024), but the orders didn't.

We considered:
- Letting only orders placed while signed in count. Simple, but it shuts out most real buyers, who are the shoppers whose reviews matter most.
- Letting a guest review through Order Lookup with the Order Code. The code is too weak to sign a public Review with, and it can be shared.

We chose to let a guest order **join** an account once that account verifies the order's phone number, at the same moment its Held Points are credited. A joined order belongs to the account like any other: it appears in order history at every status and can be reviewed. Accounts that verified a phone before this change get their matching guest orders once, at release.

## Consequences

- Joining happens once and for good. If the member later changes phone, joined orders stay, and guest orders placed with the new phone join once that phone is verified.
- Whoever verifies a phone gets every guest order placed with it. A guest who ships to a friend's number puts that order, including the guest's address, in the friend's history, and the friend can review it. We accept this, as ADR-0024 does for points. The later fix is asking at checkout whether the order is the shopper's own.
- Phone numbers are matched in one normalised form (spaces, dots and dashes ignored, +84 read as 0), the same one Held Points use.
