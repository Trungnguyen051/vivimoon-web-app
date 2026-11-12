# A phone sign-up is not an account until its OTP is verified

**Status:** accepted — settled during the account/auth redesign grill (Figma "Tài khoản").

Sign-up used to create the account immediately and offer OTP verification as an optional follow-up ("verification is not a gate"). The redesign makes the phone number the sign-in identifier: the sign-in screen asks for a phone and a password, and the sign-up flow goes name + phone + password → a six-box OTP screen with no skip → the welcome step.

Keeping verification optional was rejected. When the phone is the login name, an unverified phone means one shopper can squat another's number, and every later phone-keyed action (order lookup, reset) trusts a number nobody proved they hold. A "do it later" link was also rejected — it is the same hole with an extra click.

So registration does not start a session. It issues a `signup` OTP challenge, and the account becomes usable only when that challenge is verified; verify is what starts the session. Google and Apple sign-ins are unaffected — the provider has already vouched for the identity, and those accounts may have no phone at all.

## Consequences

A shopper who abandons the OTP screen has no account and must sign up again. Email is still accepted as a sign-in identifier behind a phone-labelled field so existing email accounts keep working, but the sign-up form no longer offers email. Resend is the only recovery path on the OTP screen: when the countdown ends, the expiry text becomes a "Gửi lại mã" link in the same spot.
