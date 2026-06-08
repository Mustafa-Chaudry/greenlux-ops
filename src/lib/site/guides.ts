export type GuideIcon = "map" | "hospital" | "food" | "park" | "route" | "passport";

export type SiteGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageCredit?: GuideImageCredit;
  highlights: string[];
  whoItHelps: string;
  whyItMatters: string;
  suggestedRoomType: string;
  planningSections: Array<{
    title: string;
    body: string;
  }>;
  localNotes?: Array<{
    title: string;
    body: string;
  }>;
  bookingQuestions: string[];
  stayTypes: string[];
  icon: GuideIcon;
  href: string;
  supportImageSrc?: string;
  supportImageAlt?: string;
  supportLabel?: string;
  supportImageCredit?: GuideImageCredit;
};

export type GuideImageCredit = {
  label: string;
  href: string;
  license: string;
  licenseHref: string;
};

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

const commonsImage = (fileName: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;

const ccBySa4 = "https://creativecommons.org/licenses/by-sa/4.0/";
const ccBySa3 = "https://creativecommons.org/licenses/by-sa/3.0/";

const commonsCredits = {
  faisalMosque: {
    label: "Abdul Haseeb Mustafa / Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Faisal_Mosque,_Shah_Faisal_Ave,_E-8,_Islamabad,_Islamabad_Capital_Territory_44000.jpg",
    license: "CC BY-SA 4.0",
    licenseHref: ccBySa4,
  },
  jinnahPark: {
    label: "Inlandmamba / Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Jinnah_Park_Entrance.jpg",
    license: "CC BY-SA 3.0",
    licenseHref: ccBySa3,
  },
  nathiaGali: {
    label: "Mohammed-Daanyaal Aziz / Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Nathia_Gali_Trees.jpg",
    license: "CC BY-SA 4.0",
    licenseHref: ccBySa4,
  },
  hunza: {
    label: "Muhammad Amjad Jamal / Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Hunza_Valley,_Hunza.jpg",
    license: "CC BY-SA 4.0",
    licenseHref: ccBySa4,
  },
  joyland: {
    label: "Fahads1982 / Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Night_view_of_Joyland_Rawalpindi.png",
    license: "CC BY-SA 4.0",
    licenseHref: ccBySa4,
  },
} satisfies Record<string, GuideImageCredit>;

export const guides: SiteGuide[] = [
  {
    slug: "westridge-rawalpindi",
    title: "Westridge 1 location guide",
    shortTitle: "Westridge 1",
    description:
      "Stay in Westridge 1 when you want a quieter Rawalpindi base with groceries, food, parks, hospitals, city movement, and Islamabad access within practical reach.",
    imageSrc: "/greenlux/curation-review/guides/03__guide-card__Westridge-1-location-guide__army-museum-park.jpg",
    imageAlt: "Aircraft display in a Westridge local attraction park",
    highlights: ["Cantonment-side residential feel", "Groceries and errands nearby", "Useful for Rawalpindi and Islamabad plans"],
    whoItHelps: "Families, overseas Pakistanis, repeat guests, work travellers, and short-stay guests who want the area to feel manageable.",
    whyItMatters: "A well-placed base reduces the small stresses of arrival, errands, meals, transport, and daily movement.",
    suggestedRoomType: "Ask about studios or apartments for longer stays; private rooms for short, simple trips.",
    planningSections: [
      {
        title: "Start with the area, then choose the room",
        body:
          "Westridge 1 is useful when the stay has a real purpose beyond sleeping: family visits, hospital appointments, errands, food, parks, or movement between Rawalpindi and Islamabad. GreenLux gives you a quieter base and direct WhatsApp guidance before arrival.",
      },
      {
        title: "Match the room to the length of stay",
        body:
          "For one or two nights, a private room can keep the trip simple. For longer visits, a studio or apartment gives more privacy, space for luggage, and a better rhythm for family plans, work calls, or daily meals.",
      },
    ],
    localNotes: [
      {
        title: "Everyday questions to settle early",
        body:
          "Before you arrive, it helps to know where you will eat, buy groceries, arrange transport, and reach family, hospitals, Saddar, Islamabad, railway access, or bus terminals. GreenLux can help you think through those details before you commit.",
      },
      {
        title: "Best GreenLux use case",
        body:
          "This location works best for guests who want Rawalpindi access without feeling stuck in a noisy commercial stay. Share your dates, guest count, and main plans so the team can suggest the right fit.",
      },
    ],
    bookingQuestions: [
      "Share whether your plans are mostly in Rawalpindi, Islamabad, or both.",
      "Mention whether kitchen access, extra family space, parking, or outdoor space matters.",
      "Share your arrival time so the team can guide check-in and local movement clearly.",
    ],
    stayTypes: ["Studios", "Private rooms", "Family apartments"],
    icon: "map",
    href: "/guides/westridge-rawalpindi",
  },
  {
    slug: "nearby-hospitals",
    title: "Nearby hospitals and medical visits",
    shortTitle: "Medical visits",
    description:
      "For patients, attendants, and families who need a quieter Rawalpindi stay around appointments, follow-ups, or recovery time.",
    imageSrc: "/greenlux/curation-review/guides/04__guide-card__Nearby-hospitals-and-medical-visits__quaid-e-azam-international-hospital.webp",
    imageAlt: "Quaid-e-Azam International Hospital building",
    highlights: ["Quaid-e-Azam International, CMH, MH and AFIC in reach", "Privacy between appointments", "Direct WhatsApp support before arrival"],
    whoItHelps: "Patients, attendants, relatives, and families coordinating appointment-led travel.",
    whyItMatters: "Medical trips feel easier when the stay is calm, private, and planned around appointment timing.",
    suggestedRoomType: "Ask about studios or apartments for privacy and attendants; private rooms for short appointment visits.",
    planningSections: [
      {
        title: "Plan around the appointment, not just the date",
        body:
          "For medical visits, the important details are arrival time, rest, privacy, attendant space, and how close the room feels to the day's appointments. Share the appointment window before booking so GreenLux can suggest a calmer setup.",
      },
      {
        title: "When more space is worth it",
        body:
          "A studio or apartment can make recovery time, multiple appointment days, or family support easier. A private room may be enough when the stay is short and the priority is value, cleanliness, and direct communication.",
      },
    ],
    localNotes: [
      {
        title: "Hospitals and clinics to plan around",
        body:
          "GreenLux guests commonly plan around Quaid-e-Azam International Hospital, CMH, MH, AFIC, Mega Medical Complex, Nusrat Hospital, Maryam Memorial Hospital, Valley Clinic, Hope Clinic, Dr. Seemi's Clinic, Nishat Hospital, and other Rawalpindi medical points. Quaid-e-Azam International Hospital is often reachable in around 15 minutes in ordinary traffic, while CMH, MH, and AFIC are closer local hospital points. Travel time depends on traffic, gate access, and appointment timing.",
      },
      {
        title: "Medical boundary",
        body:
          "GreenLux does not provide medical advice or hospital recommendations. The value is a quieter stay, clear arrival support, and room guidance around your appointment schedule.",
      },
    ],
    bookingQuestions: [
      "Share the appointment date, hospital or clinic area, and expected arrival time.",
      "Mention whether the guest needs privacy, extra rest, or space for an attendant.",
      "Ask which available room is easiest for a quieter medical-visit stay.",
    ],
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "hospital",
    href: "/guides/nearby-hospitals",
  },
  {
    slug: "parks-nearby",
    title: "Race Course Park and family outings",
    shortTitle: "Race Course Park",
    description:
      "A family-focused guide to nearby green space, Race Course Park, and simple outings that make longer Rawalpindi stays easier.",
    imageSrc: "/greenlux/curation-review/guides/05__guide-card__Race-Course-Park-and-family-outings__race-course-park.jpg",
    imageAlt: "Tree-lined walkway inside Race Course Park Rawalpindi",
    highlights: ["Race Course Park for nearby walks", "Green space for children and family time", "Joyland and Ayub Park for bigger outings"],
    whoItHelps: "Families with children, overseas guests visiting relatives, and guests staying more than one night.",
    whyItMatters: "A nearby outing helps families reset between appointments, visits, meals, and errands.",
    suggestedRoomType: "Ask about apartments for families; studios for couples or smaller family stays.",
    planningSections: [
      {
        title: "Give the day somewhere to breathe",
        body:
          "Family trips are easier when there is a place to walk, let children move, or spend a calmer evening. Race Course Park is the closest kind of reset; Ayub National Park and Joyland can work for a larger family outing when timing allows.",
      },
      {
        title: "Choose space if the family will be in and out",
        body:
          "If guests are carrying luggage, travelling with children, or staying more than a night, the cheapest room is not always the easiest room. Apartments give families more room to settle; studios work for couples or smaller groups who still want privacy.",
      },
    ],
    localNotes: [
      {
        title: "What to confirm",
        body:
          "Park timings, ride availability, entry details, traffic, and parking can change. Message GreenLux before you travel if the outing matters to your plan.",
      },
      {
        title: "Why it supports the stay",
        body:
          "The advantage is the return base: after a walk, park visit, or family evening, guests come back to a quieter room, studio, or apartment instead of a rushed hotel stop.",
      },
    ],
    bookingQuestions: [
      "Share the number of adults, children, and luggage pieces.",
      "Tell GreenLux whether a family apartment or studio would feel more comfortable.",
      "Ask which stay gives children, elders, or longer family visits the most breathing room.",
    ],
    stayTypes: ["Apartments", "Studios"],
    icon: "park",
    href: "/guides/parks-nearby",
    supportImageSrc: commonsImage("Night view of Joyland Rawalpindi.png", 1200),
    supportImageAlt: "Night view of Joyland Rawalpindi amusement park",
    supportLabel: "Joyland Rawalpindi",
    supportImageCredit: commonsCredits.joyland,
  },
  {
    slug: "food-nearby",
    title: "Food nearby and daily essentials",
    shortTitle: "Food nearby",
    description:
      "Plan easy meals, snacks, tea, groceries, and familiar food stops around a GreenLux stay in Westridge 1.",
    imageSrc: "/greenlux/curation-review/guides/06__guide-card__Food-chains-and-daily-essentials__westridge-food-options.jpg",
    imageAlt: "Collage of Westridge food options including Cheezious, OPTP, Tehzeeb, and Hot N Spicy",
    highlights: ["Cheezious, OPTP, Tehzeeb and Hot N Spicy nearby", "Simple options for late arrivals", "Groceries and essentials within local reach"],
    whoItHelps: "Families arriving late, short-stay guests, business travellers, overseas guests, and longer-stay visitors who want meals to be simple.",
    whyItMatters: "The first night feels easier when food, tea, snacks, and daily essentials are not a guessing game.",
    suggestedRoomType: "Ask about studios or apartments for kitchen access; private rooms for quick stays.",
    planningSections: [
      {
        title: "Make the first evening easy",
        body:
          "After travel, most guests want the same things: a clean room, something to eat, tea or snacks, and no complicated search for basics. Westridge gives GreenLux guests nearby casual food and everyday errands without needing to plan the whole evening around it.",
      },
      {
        title: "Ask about kitchen access if meals matter",
        body:
          "Private rooms work when you plan to eat out. Studios and apartments are better for longer stays, children, breakfast routines, reheating, groceries, or guests who want a little more independence.",
      },
    ],
    localNotes: [
      {
        title: "Food names guests recognise",
        body:
          "Nearby and accessible options include Westridge favourites and familiar brands such as Cheezious, OPTP, Tehzeeb, Hot N Spicy, Tornado Fries, Food Hut Pulao Kabab, Kin's Crunchy Chicken, McDonald's, Subway, Savour Foods, and other casual stops. Opening times and delivery options can change.",
      },
      {
        title: "What to message before arrival",
        body:
          "If you are arriving late, travelling with children, or need groceries, tell GreenLux before you arrive. The team can help you think through food, tea, snacks, and room type.",
      },
    ],
    bookingQuestions: [
      "Mention if you are arriving late and may need food guidance.",
      "Ask whether kitchen access matters for your selected room type.",
      "Tell GreenLux if groceries, tea, snacks, or family meals are part of your plan.",
    ],
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "food",
    href: "/guides/food-nearby",
  },
  {
    slug: "rawalpindi-islamabad-access",
    title: "Rawalpindi and Islamabad access",
    shortTitle: "City access",
    description:
      "Use GreenLux as a quieter Rawalpindi base when your plans move between family, work, appointments, errands, and Islamabad.",
    imageSrc: commonsImage("Faisal Mosque, Shah Faisal Ave, E-8, Islamabad, Islamabad Capital Territory 44000.jpg"),
    imageAlt: "Faisal Mosque in Islamabad with Margalla Hills behind it",
    imageCredit: commonsCredits.faisalMosque,
    highlights: ["Rawalpindi base with Islamabad access", "Useful for work, family, and mixed plans", "Room guidance before you book"],
    whoItHelps: "Business travellers, families, appointment-led guests, and visitors whose day may cross both cities.",
    whyItMatters: "When the trip has movement, choosing the right base and room type matters more than chasing the busiest address.",
    suggestedRoomType: "Ask about executive rooms or studios for work; apartments for longer mixed-city stays.",
    planningSections: [
      {
        title: "One base for a mixed day",
        body:
          "Many guests are not visiting one single place. The day may include family in Rawalpindi, errands in the cantonment area, work toward Islamabad, or appointments in between. GreenLux helps guests choose a stay that fits that movement.",
      },
      {
        title: "Protect the quiet part of the trip",
        body:
          "A room should make the day easier when you return. Executive rooms and studios suit focused work or short trips. Apartments help when family, luggage, or longer stays need more breathing room.",
      },
    ],
    bookingQuestions: [
      "Share whether the stay is for work, family, appointments, or mixed plans.",
      "Mention if you expect daily movement between Rawalpindi and Islamabad.",
      "Ask GreenLux which room type fits your schedule and guest count.",
    ],
    stayTypes: ["Executive rooms", "Studios", "Apartments"],
    icon: "route",
    href: "/guides/rawalpindi-islamabad-access",
  },
  {
    slug: "international-guest-tips",
    title: "International guest arrival tips",
    shortTitle: "Arrival tips",
    description:
      "A simple arrival guide for overseas guests and returning families who want location, room choice, and check-in details clear before travel.",
    imageSrc: "/greenlux/curation-review/guides/08__guide-card__International-guest-practical-tips__race-course-park.jpg",
    imageAlt: "Calm tree-lined walkway in a nearby Rawalpindi park",
    highlights: ["Confirm arrival time early", "Use online check-in after booking", "Ask on WhatsApp for location and room fit"],
    whoItHelps: "International guests, overseas Pakistanis, families arriving from the airport, and first-time GreenLux visitors.",
    whyItMatters: "Clear WhatsApp communication before arrival helps remove uncertainty around location, timing, room fit, and check-in.",
    suggestedRoomType: "Ask about studios for privacy, apartments for families, and private rooms for short stays.",
    planningSections: [
      {
        title: "Settle the arrival before the flight",
        body:
          "Overseas guests usually want confidence before they land: where to go, when to arrive, what to share, and which stay type fits the trip. GreenLux keeps this personal through direct WhatsApp guidance.",
      },
      {
        title: "Use online check-in at the right moment",
        body:
          "Online check-in is best after dates and room choice are agreed. It helps arrival feel smoother, especially for families, late arrivals, and guests coordinating from another time zone.",
      },
    ],
    bookingQuestions: [
      "Share your arrival date, estimated time, and guest count.",
      "Mention if you are travelling internationally or arriving with family.",
      "Ask for the best room type before completing online check-in.",
    ],
    stayTypes: ["Studios", "Apartments", "Private rooms"],
    icon: "passport",
    href: "/guides/international-guest-tips",
  },
  {
    slug: "airport-arrival-planning",
    title: "Islamabad airport arrival and departure planning",
    shortTitle: "Airport travel",
    description:
      "Plan airport arrivals, late check-ins, early departures, luggage, and room choice around Islamabad International Airport.",
    imageSrc: "/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg",
    imageAlt: "GreenLux Residency parking and guest arrival area",
    highlights: ["Around 24 km from Islamabad International Airport", "Plan 35-60 minutes by car in ordinary conditions", "Allow extra time for traffic, weather, and airport procedures"],
    whoItHelps: "Airport arrivals, overseas guests, families with luggage, early departures, and late-night check-ins.",
    whyItMatters: "A clearer airport plan makes arrival feel calmer and helps GreenLux suggest the right room, timing, and check-in guidance.",
    suggestedRoomType: "Ask about private rooms for short transit; studios or apartments for families, luggage, or longer stays after arrival.",
    planningSections: [
      {
        title: "Plan the road time with a buffer",
        body:
          "GreenLux is around 15 miles / 24 km from Islamabad International Airport. Plan 35-60 minutes by car in ordinary conditions, and allow more for rush hour, rain, road restrictions, security checks, luggage, or late-night arrivals.",
      },
      {
        title: "Use the airport plan to choose the room",
        body:
          "A private room can work for a short overnight stop before or after a flight. Studios and apartments are better when guests have family luggage, children, a longer recovery stay, or need more space after international travel.",
      },
    ],
    localNotes: [
      {
        title: "Routes to confirm before travel",
        body:
          "Islamabad International Airport connects with Rawalpindi through GT Road / N-5 and with Islamabad through Srinagar Highway. Route choice, traffic, and road conditions can change, so confirm live directions before leaving.",
      },
      {
        title: "What GreenLux should know",
        body:
          "Share your flight time, expected landing or departure window, guest count, luggage, and whether you need late arrival or early checkout guidance. The team can then suggest the stay type that fits the travel day.",
      },
    ],
    bookingQuestions: [
      "Share your flight time, expected arrival or departure window, and guest count.",
      "Mention luggage, children, elders, late check-in, or early departure needs.",
      "Ask whether a private room, studio, or apartment is the better airport-travel fit.",
    ],
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "passport",
    href: "/guides/airport-arrival-planning",
  },
  {
    slug: "rawalpindi-islamabad-tourist-base",
    title: "Rawalpindi and Islamabad tourist base",
    shortTitle: "Tourist base",
    description:
      "Use GreenLux as a calmer Westridge base for Rawalpindi family plans, Jinnah Park, food, Islamabad sightseeing, and onward travel.",
    imageSrc: commonsImage("Jinnah Park Entrance.jpg", 1200),
    imageAlt: "Jinnah Park Rawalpindi entrance gate",
    imageCredit: commonsCredits.jinnahPark,
    highlights: ["Rawalpindi stay with Islamabad access", "Jinnah Park, parks, food, and city movement", "WhatsApp guidance before you head out"],
    whoItHelps: "Domestic tourists, overseas Pakistanis, families, short-stay visitors, and international guests using one base for the twin cities.",
    whyItMatters: "A calm base lets guests enjoy the city without making every day feel like a rushed hotel transfer.",
    suggestedRoomType: "Ask about studios for couples or longer stays; apartments for families; executive rooms for short city visits.",
    planningSections: [
      {
        title: "Make GreenLux the quiet part of the city trip",
        body:
          "Rawalpindi and Islamabad are easier when the day has a shape: family visits, sightseeing, food, shopping, appointments, parks, or onward travel. GreenLux gives guests a quieter place to return to and a team to message before heading out.",
      },
      {
        title: "Plan the day around people, not just places",
        body:
          "Tourists often need luggage space, privacy, late arrival help, early departure planning, or a room that suits children and elders. Share those needs early so the stay supports the day instead of fighting it.",
      },
    ],
    localNotes: [
      {
        title: "Islamabad attractions to plan around",
        body:
          "Common Islamabad visitor stops include Faisal Mosque, Pakistan Monument, Lok Virsa Museum, Rawal Lake, Daman-e-Koh, and the Margalla Hills area. Travel times can shift quickly, so check traffic and route conditions before leaving.",
      },
      {
        title: "Rawalpindi planning notes",
        body:
          "Rawalpindi plans can include Jinnah Park, Cinepax, Race Course Park, Ayub National Park, Joyland, Saddar, Raja Bazaar, food stops, hospitals, and family visits. GreenLux is strongest when guests use it as a settled base, not a rushed stopover.",
      },
      {
        title: "Family attractions near Rawalpindi",
        body:
          "Ayub National Park, Jungle World, Joyland Rawalpindi, Race Course Park, and Jinnah Park can all support a family day when timing is right. Treat travel windows as approximate: Ayub National Park and Joyland are commonly a 15-30 minute drive from Westridge, while Jinnah Park and Airport Road entertainment can take longer when traffic is heavy.",
      },
      {
        title: "Shopping, cinema, and food stops",
        body:
          "For cinema and casual evenings, plan around Cinepax at Jinnah Park, Motion Rides, gaming, McDonald's, Subway, KFC, Pappasallis, and nearby cafes. For shopping and longer stays, GreenLux can help guests think through Saddar, Raja Bazaar, Punjab Cash & Carry, Madina Cash & Carry, Cosmo, Metro, and other grocery or household-basic runs.",
      },
    ],
    bookingQuestions: [
      "Tell GreenLux whether you are visiting Rawalpindi, Islamabad, or both.",
      "Share if you need early departure, late arrival, luggage space, or family privacy.",
      "Ask which room type is best before a sightseeing or onward-travel day.",
    ],
    stayTypes: ["Studios", "Apartments", "Executive rooms"],
    icon: "route",
    href: "/guides/rawalpindi-islamabad-tourist-base",
  },
  {
    slug: "murree-nathia-gali-travel-planning",
    title: "Murree and Nathia Gali travel planning",
    shortTitle: "Murree and Galiyat",
    description:
      "Rest in Rawalpindi before or after Murree, Nathia Gali, Ayubia, and Galiyat travel, especially when family, luggage, weather, or early departure timing matters.",
    imageSrc: commonsImage("Nathia Gali Trees.jpg"),
    imageAlt: "Sunlight through trees at Nathia Gali",
    imageCredit: commonsCredits.nathiaGali,
    highlights: ["Good before early hill travel", "Useful return base after Murree or Galiyat", "Weather and road checks matter"],
    whoItHelps: "Families, couples, domestic tourists, overseas guests, and travellers planning Murree, Nathia Gali, Ayubia, or Galiyat routes.",
    whyItMatters: "Hill travel is easier when guests rest first, organise luggage, and leave with weather and road conditions in mind.",
    suggestedRoomType: "Ask about apartments for families, studios for couples, and private rooms for short overnight stops.",
    planningSections: [
      {
        title: "Rest before the uphill day",
        body:
          "Some guests land, arrive by bus, or reach Rawalpindi tired, then try to continue uphill the same day. A GreenLux night can make the trip calmer: eat, organise luggage, confirm the route, and leave early with a clearer head.",
      },
      {
        title: "Use GreenLux for the return too",
        body:
          "After Murree or Galiyat travel, guests may want a clean, managed place to recover before airport, bus, family, or Islamabad plans. Share whether GreenLux is your pre-trip night, return night, or both.",
      },
    ],
    localNotes: [
      {
        title: "What changes quickly",
        body:
          "Weather, road closures, traffic, parking, fuel, and return timing can change sharply in hill areas. GreenLux can help with stay timing, but guests should confirm live road and weather updates before leaving.",
      },
      {
        title: "Best fit",
        body:
          "Families often prefer apartments before hill travel because luggage, children, and early starts need space. Couples or short-stop travellers may be comfortable in a studio or private room.",
      },
    ],
    bookingQuestions: [
      "Share whether GreenLux is your pre-trip night, return night, or both.",
      "Mention if you have a driver, family luggage, children, or an early departure.",
      "Ask which stay is best for resting before Murree or Nathia Gali travel.",
    ],
    stayTypes: ["Apartments", "Studios", "Private rooms"],
    icon: "park",
    href: "/guides/murree-nathia-gali-travel-planning",
  },
  {
    slug: "northern-areas-bus-travel",
    title: "Northern areas bus and onward travel",
    shortTitle: "Northern travel",
    description:
      "Rest and organise in Rawalpindi before long road travel toward Gilgit, Hunza, Skardu, Murree, or other northern routes.",
    imageSrc: commonsImage("Hunza Valley, Hunza.jpg"),
    imageAlt: "Hunza Valley landscape with water, trees, and mountains",
    imageCredit: commonsCredits.hunza,
    highlights: ["Rawalpindi base before long road travel", "Bus and operator details need confirmation", "Good for early departures and luggage planning"],
    whoItHelps: "Domestic tourists, international tourists, backpackers, families, and overseas Pakistanis preparing for northern areas travel.",
    whyItMatters: "Long road journeys are easier when tickets, terminals, luggage, food, documents, and pickup timing are settled before the morning.",
    suggestedRoomType: "Ask about private rooms for one-night transit; studios or apartments for families, luggage, or recovery time.",
    planningSections: [
      {
        title: "Treat the night before as part of the trip",
        body:
          "For Gilgit, Hunza, Skardu, Chilas, Murree, or other northern routes, the night before travel matters. Confirm terminal, ticket, departure time, luggage rules, route conditions, weather, food, and pickup timing.",
      },
      {
        title: "Use GreenLux to organise the moving parts",
        body:
          "GreenLux is useful when guests need a managed place to rest, repack, charge devices, arrange pickup, and leave early. It is especially helpful for families or international guests who do not want to solve every detail on the road.",
      },
    ],
    localNotes: [
      {
        title: "Bus and terminal details",
        body:
          "NATCO, Daewoo, and private operators can change terminal details, routes, and timings. Confirm directly with the operator before travel, then tell GreenLux your departure plan so the stay can support it.",
      },
      {
        title: "Mountain travel caution",
        body:
          "Trips toward Gilgit-Baltistan and mountain areas depend on road, weather, landslide, and seasonal conditions. International guests should also check current travel advice, visa status, local registration requirements where relevant, and operator guidance before committing.",
      },
    ],
    bookingQuestions: [
      "Tell GreenLux your bus operator, terminal, and planned departure time.",
      "Mention if you need help planning early pickup, luggage, food, or rest before travel.",
      "Ask for a room type that suits one-night transit or a longer recovery stay after the trip.",
    ],
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "passport",
    href: "/guides/northern-areas-bus-travel",
  },
];

export const nearbyCategories: Array<{
  title: string;
  description: string;
  icon: GuideIcon;
}> = [
  {
    title: "Hospitals and medical visits",
    description: "A quieter base for appointments, attendants, privacy, and family support.",
    icon: "hospital",
  },
  {
    title: "Parks and family outings",
    description: "Roomier stays for families who want parks, outings, and a calmer return base.",
    icon: "park",
  },
  {
    title: "Food and daily essentials",
    description: "Plan meals, tea, snacks, groceries, and late-arrival basics before you arrive.",
    icon: "food",
  },
  {
    title: "Islamabad access",
    description: "A quieter Rawalpindi base when your plans move between Rawalpindi and Islamabad.",
    icon: "route",
  },
  {
    title: "Twin-city tourist base",
    description: "One settled base for Rawalpindi errands, Islamabad sightseeing, family visits, and short city stays.",
    icon: "route",
  },
  {
    title: "Murree and Galiyat travel",
    description: "Rest, repack, and leave clearer before Murree, Nathia Gali, Ayubia, and Galiyat travel.",
    icon: "park",
  },
  {
    title: "Northern areas onward travel",
    description: "Settle buses, terminals, early departures, luggage, and rest before Gilgit, Hunza, Skardu, or other northern routes.",
    icon: "passport",
  },
  {
    title: "Airport and arrival planning",
    description: "Plan Islamabad airport arrivals, early departures, luggage, and room fit before travel.",
    icon: "passport",
  },
  {
    title: "Business and work trips",
    description: "Private rooms and studios for short work visits, repeat stays, and focused arrivals.",
    icon: "map",
  },
];
