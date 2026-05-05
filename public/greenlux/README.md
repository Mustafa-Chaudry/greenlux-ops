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

No poster frames or compressed video versions were generated in this pass because ffmpeg/ffprobe are not available in the local environment. Existing GreenLux still images are used as poster images. Original video files remain intact.

## Curation Notes

- Room galleries intentionally use only selected images per unit, avoiding dark, blurry, cluttered, or duplicate-angle shots.
- Lead images are chosen for brightness, clean composition, and guest confidence.
- Card and gallery displays prefer clear room visibility over dramatic cropping.
- Room 9 and Room 10 are mapped from the current GreenLux WordPress apartment posts exposed by the WordPress API.
- Videos open in a modal with native controls and are muted by default. No external video hosts or hotlinks are used.
