# GreenLux Public Image Assets

The public site uses local image files only. It does not hotlink Airbnb, Booking.com, Skyscanner, Unsplash, or other external image URLs.

## Sources

- `property/` contains GreenLux-owned WordPress upload images from `https://greenluxresidency.com/wp-content/uploads/...`.
- `rooms/` contains curated GreenLux-owned WordPress room/unit galleries. Each gallery is ordered as lead room image, alternate angle, sleeping area, lounge or kitchen, bathroom, then terrace/common/detail shots where available.
- `booking/` contains selected GreenLux-owned property/common-area images originally uploaded by GreenLux/management to Booking.com. These were downloaded locally from Booking/bstatic image URLs exposed through a Booking-derived partner listing because the direct Booking.com page blocked automated inspection.

## Booking.com Local Images

- `booking/booking-terrace-01.jpg` - terrace seating, used on contact and common-area sections.
- `booking/booking-common-area-01.jpg` - common terrace seating, used on the homepage direct-booking section.
- `booking/booking-lounge-01.jpg` - shared lounge seating, used on the rooms listing hero.
- `booking/booking-dining-01.jpg` - dining/common area, used in the homepage common-areas section.
- `booking/booking-exterior-01.jpg` - exterior/terrace walkway context, used on homepage and contact CTAs.
- `booking/booking-kitchen-01.jpg` - kitchen/common area reference, reserved for future public-page use.

## Local Videos

Videos in `videos/` are GreenLux-provided local assets. They are referenced from the public prototype only through local `/greenlux/videos/...` paths.

- `property-tour-main.mp4` - main property walkthrough, used as the primary homepage tour.
- `property-gate-day.mp4` - short daytime gate/entrance preview, used on homepage, contact, and location.
- `first-floor-lounge.mp4` - lounge/common seating, used on homepage and about.
- `terrace-night.mp4` - terrace at night, used on contact.
- `1-bed-appartment-tour-day.mp4` - one-bedroom apartment tour, used on Apartment 3.
- `studio-tour.mp4` - studio tour, used on Studio 1 and Studio 2.
- `terrace-studio-appartment-entrance-night.mp4` - terrace/apartment entrance context, used on about and location.
- `gate-opening-building-shots-night-landscape.mp4` - longer night exterior context, used on location.
- `gate-driveway-parking-night.mp4` - retained locally but not used in the public UI yet.

No poster frames or compressed video versions were generated in this pass because ffmpeg/ffprobe are not available in the local environment. Existing GreenLux still images are used as poster images for property tour videos. Original video files remain intact.

## Approved Video Testimonials

Approved guest testimonial videos are copied into `testimonials/` and referenced only from local `/greenlux/testimonials/...` paths.

- `testimonials/Newzeland-male-testimonial.mp4` - approved New Zealand guest testimonial.
- `testimonials/slovakian-male-testimonial.mp4` - approved Slovakian guest testimonial.
- `testimonials/International-female-testimonial.mp4` - approved international guest testimonial.

The following Chinese-language testimonial files are present in `videos/` but are not used in the public prototype because transcript and translation have not been verified:

- `videos/Chinese-male-testimonial-in-chinese.mp4`
- `videos/Zang-male-testimonial-in-chinese.mp4`

No guest names or direct quotes are shown for video testimonials because verified transcripts were not provided. Testimonial cards intentionally do not use GreenLux property images as thumbnails; when no verified guest poster still is available, the local testimonial video itself is used as the preview frame so guests see the actual approved guest video.

## Public Rating Snapshots

The prototype uses the following provided public listing snapshots:

- Booking.com: `8.8 / 10`, `Fabulous`, `161 reviews`.
- Airbnb Studio 1: `4.86 / 5`, `21 reviews`, `Guest favorite`.
- Airbnb Budget Room: `4.69 / 5`, `13 reviews`.
- Airbnb host signal: `Superhost`, approximately `4.89 / 5`, `91-92 reviews shown on listings`.
- Skyscanner: `4.6 / 5`, `Excellent`, `7 reviews`.

These ratings are shown as platform/listing snapshots rather than a combined score.

## Location and Guide Visuals

No third-party nearby-place photos were downloaded for hospitals, food, parks, airport, or Islamabad-access sections in this pass. To avoid misleading guests with GreenLux property photos and to avoid unsafe image licensing, `/guides` and nearby-place sections use illustrated icon/location cards instead.

GreenLux-owned property images remain in use only where the page is showing GreenLux itself, such as the property, entrance, terrace, lounge, and contact/location hero sections.

The public location pages use the provided address and approximate coordinates:

- Address: `J268+6C3, Mian Iqbal Road, Westridge 1, Rawalpindi, 46000, Pakistan`
- Coordinates: `33.6062 N, 73.0232 E`
- Google Maps link: `https://www.google.com/maps/search/?api=1&query=33.6062,73.0232`

## Curation Notes

- Room galleries intentionally use only selected images per unit, avoiding dark, blurry, cluttered, or duplicate-angle shots.
- Lead images are chosen for brightness, clean composition, and guest confidence.
- Card and gallery displays prefer clear room visibility over dramatic cropping.
- Room 9 and Room 10 are mapped from the current GreenLux WordPress apartment posts exposed by the WordPress API.
- Videos open in a modal with native controls and are muted by default. No external video hosts or hotlinks are used.
