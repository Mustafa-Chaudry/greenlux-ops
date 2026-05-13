# GreenLux Hospitality Language & Brand Assets

## Voice Principles
GreenLux’s communications should always feel **warm, calm, and premium**. 
- Never use overly technical, stressful, or cold system terms when addressing guests.
- Luxury is clarity: give guests the exact details they need without confusion.

## Terms to Avoid & Preferred Alternatives
| Avoid / System Term | Preferred Guest-Facing | Preferred Admin-Facing |
|---------------------|------------------------|------------------------|
| Guest record        | Your Stay Details      | Guest Stay             |
| Submit check-in     | Submit Arrival Details | -                      |
| Pending staff update| Pending Team Review    | Pending Team Review    |
| Payment proof       | Payment Confirmation   | Payment proof / confirmation |
| Issue               | Needs Attention        | Needs Attention        |
| Outstanding balance | Balance Due            | Balance Due            |
| Booking group       | Linked Stays           | Lead Booking / Multi-Room Booking |

## Guest-Facing Wording Rules
- Use "Your Details" or "Arrival Details" instead of "Guest details".
- Acknowledge submissions calmly: "Your arrival details have been received."
- Keep descriptions clear but not overly fancy.

## Admin-Facing Wording Rules
- Keep language operationally clear so staff under pressure can quickly read statuses.
- Use "Guest Stay" instead of "Guest record".
- Retain exact financial terms (like Outstanding Balance) in reports only if it ensures financial clarity, but use "Balance Due" on general stay/payment screens.

## WhatsApp Message Rules
- **Tone:** Practical, helpful, and premium.
- **Example Wi-Fi Request:** "Hello GreenLux team, I have completed my arrival details and would like to request Wi-Fi access. My name is [Guest Name]."
- **Security:** Do not expose admin URLs or Wi-Fi passwords in automated or prefilled templates.
- **Automation:** Do not fully automate sending; always allow staff to review prefilled messages.

## Receipt Wording Rules
- Always use "Accommodation Receipt". Do not use "Tax Invoice".
- Retain clear sections: "Prepared for", "Stay Period", "Room / Suite", "Payment Summary", "Balance Due", "Additional Charges".
- End with a warm closing: "Thank you for choosing GreenLux Residency."

## Asset Usage Rules
- Do not use large building or room photos in admin operational screens to keep them fast and focused.
- Ensure any public-facing or receipt headers use lightweight, print-safe assets.

## Logo Recommendations
- **Temporary Logo:** A temporary generated logo (`GLR_Generated_Logo.png`, ~5MB) has been added to `public/greenlux/booking/`. Because of its large file size, it is *not* recommended to be used in production or receipts yet, as it may break print-to-PDF functions or slow down page loads.
- **Future Canonical Logo:** We recommend creating a lightweight, print-safe vector logo (e.g., `logo.svg`) or an optimized PNG under 100KB, placing it at `public/greenlux/brand/logo-canonical.svg`, and referencing it on the guest portal and accommodation receipts.
