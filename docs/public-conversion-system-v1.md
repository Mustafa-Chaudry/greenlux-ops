# GreenLux Public Conversion System v1

## Objective

Build the GreenLux public interface as a conversion system, not a single homepage redesign. The system should serve cold ad traffic, organic visitors, platform-referred guests, repeat guests, and confirmed guests while keeping the live website stable until preview routes are approved.

## Visitor Types

| Visitor type | Likely need | Best surface | Primary conversion |
| --- | --- | --- | --- |
| Cold ad visitor | Fast trust, price, room fit, location clarity | Ad landing page | WhatsApp enquiry with trip intent |
| Organic search visitor | Understand the property and compare rooms | Homepage + rooms | View rooms or WhatsApp availability |
| Platform-referred visitor | Validate GreenLux after Airbnb / Booking.com discovery | Arrival / direct booking concierge | WhatsApp direct booking or arrival help |
| Confirmed guest | Submit arrival details, ask for help, prepare arrival | Guest check-in / concierge | Online check-in and WhatsApp support |
| Repeat guest | Fast rebooking with minimal browsing | Direct booking / WhatsApp hub | Prefilled WhatsApp rebooking |
| Family / long-stay lead | Space, kitchen, privacy, stay length, price confidence | Stay-finder flow | Matched apartment enquiry |

## Route Jobs

| Route | Job | Notes |
| --- | --- | --- |
| `/` | Broad public brand homepage | Keep stable until a stronger approved direction exists. |
| `/rooms` | Room comparison and room-level trust | Should remain factual and searchable. |
| `/rooms/[slug]` | Specific room decision support | Good for ad deep links later. |
| `/contact` | Business contact and location fallback | Useful but should not be the main conversion path. |
| `/location` | Address and local confidence | Can support ad visitors who care about proximity. |
| `/dashboard/check-in` | Confirmed guest arrival details | Warm/confirmed guest flow, not cold traffic. |
| `/guides` | Local stay-planning hub | Converts broad search intent into useful local stay advice and room links. |
| `/guides/[slug]` | Individual SEO guide pages | Crawlable pages for local search topics such as Westridge, hospitals, food, parks, and city access. |
| Future preview routes | Tested ideas only | Use only when there is a clear hypothesis and visual approval path. |

## Current-State Surface Audit

| Surface | Current useful assets / behavior | Gap for conversion system |
| --- | --- | --- |
| Homepage `/` | Strong rotating hero, real property photos, WhatsApp / rooms / check-in CTAs, ratings, common areas, room cards, videos, FAQ. | Too broad for cold paid traffic; does not behave like a stay-finder or campaign-specific landing page. |
| Rooms `/rooms` | Decision guide, room categories, current public room data, visible prices, room cards, WhatsApp and check-in CTAs. | Needs stronger visitor-intent filtering and more direct room-match CTAs after ad landing direction is proven. |
| Room detail `/rooms/[slug]` | Room-level facts, images, amenities, and room-specific decision support. | Later should support ad deep links and intent-aware WhatsApp messages. |
| Contact / location / guides | Useful address, local area, and visitor confidence content. | Should support conversion pages rather than become the main booking path. |
| Guest check-in `/dashboard/check-in` | Confirmed guest arrival concierge with staff-help WhatsApp link. | Correctly warm/confirmed; should not be used as cold ad destination. |
| Failed ad/homepage previews | Unapproved experiments were removed from the worktree. | Lesson: do not make GreenLux feel like a funnel; preserve the stronger homepage identity. |

## Reusable Asset Pool

Use real property and room images already in the repository. Prefer curated public assets with descriptive filenames.

### Hero / Arrival Assets

- `/greenlux/curation-review/homepage/03__hero-slide__GreenLux-Residency-secure-gated-entry__gates-day-custom.png`
- `/greenlux/curation-review/homepage/04__hero-slide__GreenLux-Residency-private-driveway-and-arrival-area__driveway-broad-custom.png`
- `/greenlux/curation-review/homepage/05__hero-slide__Terrace-seating-updated.jpg`
- `/greenlux/curation-review/homepage/06__hero-slide__GreenLux-Residency-premium-rooftop-terrace-flowers__terrace-broad-updated.JPG`
- `/greenlux/curation-review/homepage/07__hero-slide__GreenLux-Residency-calm-Rooftop-terrace-garden__terrace-top-broad-changed.jpg`
- `/greenlux/curation-review/homepage/08__hero-slide__GreenLux-Residency-swing-main-apt-door-changed.JPG`

### Common Area Assets

- `/greenlux/curation-review/homepage/09__common-area__Terrace-seating-updated.jpg`
- `/greenlux/curation-review/homepage/10__common-area__Shared-dining-dining-updated.webp`
- `/greenlux/curation-review/homepage/11__common-area__shared-lounge-changed.jpg`
- `/greenlux/curation-review/rooms-page/03__rooms-page-image__booking-lounge-01__booking-lounge-01.jpg`

### Room Match Assets

Use the first existing `room.images` entry from `src/lib/site/rooms.ts` where possible. If a more campaign-suitable card crop is needed, reuse the current rooms-page card image map:

- Studio 1: `/greenlux/curation-review/rooms-page/04__room-card__Studio-1__studio-1-main-updated.png`
- Studio 2: `/greenlux/curation-review/rooms-page/05__room-card__Studio-2__studio-2-main-updated.jpg`
- Apartment 3: `/greenlux/curation-review/rooms-page/06__room-card__Apartment-3__apartment-3-bed-changed.jpg`
- Apartment 4: `/greenlux/curation-review/rooms-page/07__room-card__Apartment-4__apartment-4-1.jpg`
- Room 5: `/greenlux/curation-review/rooms-page/08__room-card__Room-5__room-5-1.jpg`
- Room 10: `/greenlux/curation-review/rooms-page/11__room-card__Room-10__room-10-1.jpg`
- Budget Room 11: `/greenlux/curation-review/rooms-page/13__room-card__Budget-Room-11__budget-room-11-1.jpg`

### Asset Exclusions

- Do not use generated or oversized logo assets in preview builds unless the task is specifically brand/logo integration.
- Do not use private admin images, documents, payment proof, receipts, or guest-uploaded files.
- Do not generate factual room/property imagery. If generation is used later, limit it to abstract polish textures or non-factual campaign atmosphere.

## First Build Priority

The first priority is SEO and helpful local content around the existing homepage, not a new ad-landing design.

This direction has higher confidence because the current homepage already carries the property atmosphere and hospitality tone better than the rejected preview. The system should make that homepage easier to discover, support it with crawlable guide pages, and improve room discovery without making GreenLux feel like a funnel.

## SEO And Content Requirements

- Keep the real homepage as the public baseline.
- Add crawler foundations: sitemap, robots rules, canonical URLs, and structured data.
- Turn local stay-planning content into crawlable pages:
  - Westridge 1 location guide
  - Nearby hospitals and medical visits
  - Race Course Park and family outings
  - Food chains and daily essentials
  - Rawalpindi and Islamabad access
  - International guest practical tips
  - Rawalpindi and Islamabad tourist base
  - Murree and Nathia Gali travel planning
  - Northern areas bus and onward travel
- Link from the homepage to guide pages in a restrained way that preserves the page's existing feel.
- Link from guide pages back to rooms and WhatsApp.
- Keep room pages as the main conversion layer for specific stays.
- Use real GreenLux property and room imagery only.
- Keep copy premium, calm, and practical.
- Verify time-sensitive travel, terminal, route, weather, and tourism claims before adding them, then phrase them as planning guidance rather than fixed guarantees.
- Do not expose private guest, admin, payment, document, receipt, or Wi-Fi data.

## Failed Preview Lesson

The Direct Stay Finder preview was rejected because it made the page feel like a funnel/tool rather than a premium serviced-stay brand. The mechanics had some value, but the visible design and copy were weaker than the existing homepage.

Lessons to carry forward:

- Do not replace the homepage with a funnel-led page.
- Do not put "what kind of stay do you need?" as the dominant first-screen identity.
- Use intent only quietly: WhatsApp message templates, room-page CTAs, guide-page routing, and future measurement.
- Preserve the existing rotating hero and hospitality tone unless a future option is clearly better.
- Treat SEO/content and room discovery as the safer path before any public redesign.

## Ad Audience Matrix

| Ad audience | Visitor concern | Page promise | Room steering | Primary CTA |
| --- | --- | --- | --- | --- |
| Family visit | Space, privacy, kitchen, safety | A calm serviced stay with room for family routines. | Apartment 3, Apartment 4, selected studios | Ask for family stay |
| Work trip | Quiet, Wi-Fi, desk / lounge, easy arrival | A private base for work trips between Rawalpindi and Islamabad. | Studio 1, Studio 2, Apartment 4 | Ask for work-trip room |
| Medical visit | Calm location, clear support, flexible dates | A quiet place to stay while managing appointments and family support. | Apartment 3, Studio 2, private rooms by availability | Ask for medical-visit stay |
| Couple / private stay | Privacy, cleanliness, comfort | A private studio or room with direct host support. | Studio 2, Studio 1, executive / deluxe rooms | Ask for private stay |
| Long stay | Price clarity, kitchen, laundry / terrace, independence | A more settled serviced stay for longer visits. | Studio 1, Apartment 3, Apartment 4 | Ask for long-stay options |
| Need kitchen | Cooking, fridge, dining, independence | Choose a studio or apartment with kitchen access where listed. | Studio 1, Studio 2, Apartment 3, Apartment 4 | Ask for kitchen stay |
| Need soon | Availability, speed, real human reply | Message GreenLux directly for today or tomorrow availability. | Best available room from current inventory | Check availability now |
| Budget-aware | Starting price, clean room, no confusion | Clear starting prices with direct availability confirmation. | Units / rooms from PKR 10,000 where applicable | Ask for best available rate |

## WhatsApp Intent Messages

Use these as deterministic message templates for preview CTAs. They should be encoded with the existing `getWhatsAppHref` helper and remain editable by the visitor before sending.

| Intent | Prefilled message |
| --- | --- |
| General availability | Hi GreenLux Residency, I would like to check availability. My dates are [dates], and we are [guest count] guests. |
| Family stay | Hi GreenLux Residency, I am looking for a family stay. My dates are [dates], and we are [guest count] guests. Please suggest the best room or apartment. |
| Work trip | Hi GreenLux Residency, I am visiting for a work trip and need a quiet stay. My dates are [dates]. Please share suitable room options and availability. |
| Medical visit | Hi GreenLux Residency, I am looking for a calm stay for a medical visit. My dates are [dates]. Please suggest suitable rooms and availability. |
| Couple / private stay | Hi GreenLux Residency, I would like a private room or studio for [dates]. Please share availability and rates. |
| Long stay | Hi GreenLux Residency, I am interested in a longer stay from [start date] to [end date]. Please share suitable room or apartment options. |
| Kitchen access | Hi GreenLux Residency, I need a stay with kitchen access. My dates are [dates]. Please suggest available studios or apartments. |
| Today / tomorrow | Hi GreenLux Residency, I would like to check availability for today or tomorrow. Please share the best available room and rate. |
| Best rate | Hi GreenLux Residency, I would like to know the best available direct rate for [dates]. We are [guest count] guests. |

## Measurement Later

After a preview direction is approved, add lightweight tracking hooks before production promotion:

- WhatsApp CTA intent label
- Source page label
- Trip intent selected
- Room slug where applicable
- Campaign landing variant where applicable

Do not add analytics or ad pixels until the desired tracking provider and privacy approach are confirmed.

## Campaign Entry Architecture

Start with one preview page and avoid creating many campaign routes before the conversion model is approved. Once the first preview is working, the campaign system can branch into focused live routes.

| Future route candidate | Primary audience | Ad promise | Recommended first action |
| --- | --- | --- | --- |
| `/stay/rawalpindi-serviced-rooms` | Broad cold search traffic | Private rooms and serviced apartments in Rawalpindi with direct host support. | Choose trip intent |
| `/stay/family-apartment-rawalpindi` | Family and group stays | A calm family stay with apartment space, kitchen options, and WhatsApp guidance. | Ask for family stay |
| `/stay/long-stay-rawalpindi` | Long-stay and returning visitors | More settled serviced stays with kitchen, terrace, and direct support options. | Ask for long-stay options |
| `/stay/work-trip-rawalpindi` | Business visitors | A quiet base for work trips between Rawalpindi and Islamabad. | Ask for work-trip room |
| `/stay/medical-visit-rawalpindi` | Medical travel / family support | A calm place to stay while managing appointments and family support. | Ask for medical-visit stay |
| `/stay/private-studio-rawalpindi` | Couples / private stays | Private studios and rooms with clear availability and direct GreenLux support. | Ask for private stay |
| `/arrival` or `/guest-guide` | Warm / platform-referred guests | Already booked or comparing GreenLux? Get arrival help and direct support. | Complete check-in or WhatsApp staff |

Do not add these live routes until the preview has an approved visual direction, validated CTA behavior, and a clear campaign reason.

## Measurement Taxonomy

When measurement is added, keep it simple and business-readable. The first version should answer: which page, which visitor intent, which room, and which CTA created a WhatsApp click.

### CTA Event

Suggested event name:

`public_whatsapp_cta_click`

Suggested properties:

| Property | Example | Notes |
| --- | --- | --- |
| `page_surface` | `ad_landing_preview` | Use stable internal labels, not full URLs. |
| `page_variant` | `stay_finder_first` | Useful for A/B tests later. |
| `visitor_intent` | `family_stay` | Use the intent IDs from the page config. |
| `room_slug` | `apartment-3` | Optional; only present when CTA is room-specific. |
| `cta_location` | `hero`, `matched_room`, `final_hub` | Helps find which section converts. |
| `destination` | `whatsapp`, `rooms`, `check_in` | Track all major public CTAs, not only WhatsApp. |
| `source_param` | `google`, `meta`, `chatgpt` | Preserve from query params when available. |
| `campaign_param` | `family_apartment_june` | Optional; do not rely on it being present. |

### Query Parameters To Preserve

The system should tolerate standard campaign parameters without requiring them:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid`
- `fbclid`

Do not put raw campaign IDs into the WhatsApp message by default. Use them for analytics only unless staff explicitly want source context inside the message.

### Source-Aware WhatsApp Messages

The public-facing message should stay human and editable. If a source label is added later, keep it subtle:

`Hi GreenLux Residency, I saw your stay page and would like to check availability for [dates]. We are [guest count] guests.`

Avoid awkward tracking language such as campaign codes, ad IDs, or platform jargon inside guest messages.

## Promotion Rule

No preview route becomes the live homepage or a public ad destination until it is visually approved, mobile-checked, and validated with the standard source checks.

## Public Interface Roadmap

### Phase 1: SEO And Local Stay Planning Foundation

Preserve the current homepage and build the crawlable content foundation around it. This is the first priority because it supports organic discovery without weakening the existing public-facing experience.

Deliverables:

- Sitemap and robots rules.
- Canonical metadata for public pages.
- LodgingBusiness structured data on the homepage.
- Room-level structured data on room detail pages.
- Individual guide pages for local stay-planning topics.
- Expanded guide pages carrying old-blog SEO value into current content, including hospitals, food, Race Course Park, Westridge, twin-city tourism, Murree / Galiyat travel, and northern areas bus planning.
- Homepage links into those guide pages.
- Guide pages linking back to rooms and WhatsApp.

### Phase 2: Room Discovery Upgrade

Improve `/rooms` and selected `/rooms/[slug]` pages after the SEO foundation is stable. Room discovery should help organic visitors compare fit quickly without redesigning the homepage.

Deliverables:

- Room comparison by stay type: private room, studio, full apartment.
- Price anchors and guest capacity visible before long descriptions.
- Room-level WhatsApp CTAs with intent-aware messages.
- Clear filters or sections for family, work, long stay, kitchen, and budget-aware visitors.
- No change to operational room truth or reporting logic.

### Phase 3: Broad Homepage Direction

Only revisit `/` after the ad landing page and room discovery have a stronger conversion model. The homepage should stay broader than an ad page, but it should route visitors into the right journey faster.

Deliverables:

- Keep or improve the rotating hero if it remains the strongest brand signal.
- Add clearer visitor routing: book direct, compare rooms, already booked, location, contact.
- Avoid making `/` too campaign-specific.
- Promote only approved preview sections into the live homepage.

### Phase 4: Platform-Referred / Warm Guest Concierge

Build a future `/design-preview/arrival-concierge` or equivalent warm-traffic preview for people coming from Airbnb, Booking.com, repeat stays, or confirmed bookings.

Deliverables:

- Separate direct booking from confirmed guest check-in.
- Help warm visitors ask about direct stays, arrival timing, and room fit.
- Keep `/dashboard/check-in` focused on confirmed arrival details.
- Do not expose private guest data, documents, receipts, payment proof, or Wi-Fi passwords.

### Phase 5: Measurement And Campaign Readiness

Add lightweight measurement only after the SEO and room-discovery surfaces are approved.

Deliverables:

- CTA labels for WhatsApp click intent.
- Page source labels for ad landing, rooms, homepage, and warm concierge.
- Optional query-param preservation for campaign source.
- Analytics provider decision made before pixels or scripts are added.
- Privacy and consent implications reviewed before production tracking.

## System Acceptance Criteria

The GreenLux public conversion system is not complete until current evidence proves the following:

- Cold ad visitors have a focused landing page that answers trust, price, location, room fit, availability, and support.
- Organic visitors can understand GreenLux and compare rooms without needing staff help first.
- Platform-referred visitors have a clear path to direct booking or arrival support.
- Confirmed guests have a calm check-in path that does not expose sensitive data.
- Every major public CTA either helps compare rooms, check availability, contact GreenLux, or complete confirmed arrival details.
- WhatsApp messages are prefilled but never automatically sent.
- Public pages use real GreenLux property and room imagery only.
- Prices shown on public surfaces match the approved current public room data.
- Preview routes are noindexed and unlinked until approved.
- Live route changes are made only after visual approval and validation.
- Standard checks pass for source changes: `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

## Validation For SEO Foundation

Run:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Manual browser checks:

- `/` remains visually aligned with the approved homepage baseline.
- `/sitemap.xml` includes public pages, room pages, and guide pages.
- `/robots.txt` blocks admin/auth/dashboard/design-preview routes.
- `/guides/[slug]` pages load, include canonical metadata, and link back to rooms / WhatsApp.
- `/rooms/[slug]` pages load, include canonical metadata, and use room-level structured data.
- Homepage contains direct links to guide pages.
- No private admin, guest document, payment proof, receipt, or Wi-Fi data appears.
