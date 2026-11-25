/**
 * ⚠️ ISOLATED MOCK FIXTURES — VISUAL PROTOTYPING ONLY (playbook rule 9).
 * Used solely to demo the public UI during Phase 2. Replaced by the real
 * listings API in Phase 3. Never wire into production paths.
 */

export type EmirateCode = "AUH" | "DXB" | "SHJ" | "AJM" | "UAQ" | "RAK" | "FUJ";
export type VehicleCategoryCode = "cars" | "motorcycles" | "boats";

export type MockSeller = {
  name: string;
  type: "individual" | "dealer";
  since: number;
  verified: boolean;
  phone: string; // E.164 without '+', e.g. 971501234567
  whatsapp: string;
  dealerName?: string;
};

export type MockListing = {
  id: string;
  category: VehicleCategoryCode;
  title: string;
  priceAed: number;
  negotiable?: boolean;
  year: number;
  mileageKm: number | null;
  make: string;
  model: string;
  trim?: string;
  emirate: EmirateCode;
  city: string;
  condition: "new" | "used";
  description: string;
  photoCount: number;
  videoUrl?: string;
  featured?: boolean;
  urgent?: boolean;
  createdAt: string; // ISO date
  // cars
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "hybrid" | "electric";
  regionalSpec?: "gcc" | "american" | "european" | "japanese";
  bodyType?: string;
  colour?: string;
  warranty?: boolean;
  // motorcycles
  engineCc?: number;
  motoType?: "sport" | "cruiser" | "touring" | "adventure" | "scooter";
  // boats
  boatType?: "yacht" | "fishing" | "speedboat" | "jetski" | "sailboat";
  lengthFt?: number;
  engineHours?: number;
  engineType?: string;
  seller: MockSeller;
};

const DEALER_AL_AIN: MockSeller = {
  name: "Khalid M.",
  type: "dealer",
  since: 2019,
  verified: true,
  phone: "971501112233",
  whatsapp: "971501112233",
  dealerName: "Emirates Premium Motors",
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "nissan-patrol-platinum-2023",
    category: "cars",
    title: "Nissan Patrol Platinum V8",
    priceAed: 245000,
    year: 2023,
    mileageKm: 18500,
    make: "Nissan",
    model: "Patrol",
    trim: "Platinum",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "gcc",
    bodyType: "SUV",
    colour: "White",
    warranty: true,
    description:
      "GCC-spec Nissan Patrol Platinum in excellent condition. Full service history at the agency, single owner, no accidents. Loaded with leather interior, 360 cameras and cooled seats.",
    photoCount: 8,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    featured: true,
    createdAt: "2026-11-24T09:00:00Z",
    seller: DEALER_AL_AIN,
  },
  {
    id: "toyota-land-cruiser-gxr-2022",
    category: "cars",
    title: "Toyota Land Cruiser GXR",
    priceAed: 189000,
    negotiable: true,
    year: 2022,
    mileageKm: 42000,
    make: "Toyota",
    model: "Land Cruiser",
    trim: "GXR",
    emirate: "AUH",
    city: "Abu Dhabi",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "gcc",
    bodyType: "SUV",
    colour: "Black",
    warranty: false,
    description:
      "Well-maintained Land Cruiser GXR, GCC specs. Regularly serviced, new tyres, ready for immediate transfer. Slight negotiation for serious buyers.",
    photoCount: 6,
    featured: true,
    createdAt: "2026-11-23T15:30:00Z",
    seller: {
      name: "Ahmed R.",
      type: "individual",
      since: 2021,
      verified: true,
      phone: "971509988776",
      whatsapp: "971509988776",
    },
  },
  {
    id: "mercedes-g63-amg-2024",
    category: "cars",
    title: "Mercedes-Benz G 63 AMG",
    priceAed: 615000,
    year: 2024,
    mileageKm: 5500,
    make: "Mercedes-Benz",
    model: "G-Class",
    trim: "G 63 AMG",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "gcc",
    bodyType: "SUV",
    colour: "Matte Grey",
    warranty: true,
    description:
      "Almost-new G 63 AMG with remaining agency warranty. Night package, carbon interior, Burmester sound. Showroom condition.",
    photoCount: 10,
    createdAt: "2026-11-22T11:00:00Z",
    seller: DEALER_AL_AIN,
  },
  {
    id: "bmw-x5-xdrive40i-2021",
    category: "cars",
    title: "BMW X5 xDrive40i",
    priceAed: 165000,
    year: 2021,
    mileageKm: 61000,
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    emirate: "SHJ",
    city: "Sharjah",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "american",
    bodyType: "SUV",
    colour: "Blue",
    warranty: false,
    description:
      "American-spec BMW X5 in very good condition. Panoramic roof, Harman Kardon, fresh import with clean title.",
    photoCount: 7,
    urgent: true,
    createdAt: "2026-11-21T18:45:00Z",
    seller: {
      name: "Omar S.",
      type: "individual",
      since: 2023,
      verified: false,
      phone: "971554455667",
      whatsapp: "971554455667",
    },
  },
  {
    id: "lexus-lx600-2024",
    category: "cars",
    title: "Lexus LX 600 F Sport",
    priceAed: 425000,
    year: 2024,
    mileageKm: 9000,
    make: "Lexus",
    model: "LX",
    trim: "600 F Sport",
    emirate: "AUH",
    city: "Abu Dhabi",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "gcc",
    bodyType: "SUV",
    colour: "Silver",
    warranty: true,
    description:
      "LX 600 F Sport, GCC spec, under warranty with service package. Mark Levinson audio, rear entertainment. Immaculate inside out.",
    photoCount: 9,
    featured: true,
    createdAt: "2026-11-20T08:15:00Z",
    seller: DEALER_AL_AIN,
  },
  {
    id: "porsche-911-carrera-2020",
    category: "cars",
    title: "Porsche 911 Carrera S",
    priceAed: 398000,
    negotiable: true,
    year: 2020,
    mileageKm: 28000,
    make: "Porsche",
    model: "911",
    trim: "Carrera S",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    transmission: "automatic",
    fuelType: "petrol",
    regionalSpec: "european",
    bodyType: "Coupe",
    colour: "Guards Red",
    warranty: false,
    description:
      "European-spec 992 Carrera S. Sport Chrono, PASM, full Porsche service history. A proper driver's car.",
    photoCount: 12,
    createdAt: "2026-11-19T14:00:00Z",
    seller: {
      name: "Rashid K.",
      type: "individual",
      since: 2020,
      verified: true,
      phone: "971502233445",
      whatsapp: "971502233445",
    },
  },
  {
    id: "harley-fat-boy-114-2021",
    category: "motorcycles",
    title: "Harley-Davidson Fat Boy 114",
    priceAed: 78000,
    year: 2021,
    mileageKm: 9300,
    make: "Harley-Davidson",
    model: "Fat Boy 114",
    emirate: "SHJ",
    city: "Sharjah",
    condition: "used",
    engineCc: 1868,
    motoType: "cruiser",
    description:
      "Iconic Fat Boy 114 in great shape. Stage 1 exhaust, detachable windshield, always garaged. Selling due to upgrade.",
    photoCount: 5,
    urgent: true,
    createdAt: "2026-11-22T16:20:00Z",
    seller: {
      name: "Saeed H.",
      type: "individual",
      since: 2022,
      verified: true,
      phone: "971556677889",
      whatsapp: "971556677889",
    },
  },
  {
    id: "yamaha-yzf-r1-2023",
    category: "motorcycles",
    title: "Yamaha YZF-R1",
    priceAed: 72000,
    year: 2023,
    mileageKm: 4200,
    make: "Yamaha",
    model: "YZF-R1",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    engineCc: 998,
    motoType: "sport",
    description:
      "Track-ready R1 with low kilometers. Quickshifter, traction control, never dropped. All stock parts included.",
    photoCount: 6,
    createdAt: "2026-11-21T10:05:00Z",
    seller: {
      name: "Faisal A.",
      type: "individual",
      since: 2024,
      verified: false,
      phone: "971501234098",
      whatsapp: "971501234098",
    },
  },
  {
    id: "honda-gold-wing-2022",
    category: "motorcycles",
    title: "Honda Gold Wing Tour",
    priceAed: 115000,
    negotiable: true,
    year: 2022,
    mileageKm: 15000,
    make: "Honda",
    model: "Gold Wing",
    trim: "Tour DCT",
    emirate: "AUH",
    city: "Abu Dhabi",
    condition: "used",
    engineCc: 1833,
    motoType: "touring",
    description:
      "The ultimate tourer: DCT gearbox, airbag model, heated seats, navigation. Perfect for long UAE-Oman rides.",
    photoCount: 7,
    featured: true,
    createdAt: "2026-11-18T12:00:00Z",
    seller: {
      name: "Majid N.",
      type: "dealer",
      since: 2018,
      verified: true,
      phone: "971505566778",
      whatsapp: "971505566778",
      dealerName: "Capital Bikes",
    },
  },
  {
    id: "ktm-1290-adventure-2023",
    category: "motorcycles",
    title: "KTM 1290 Super Adventure S",
    priceAed: 68000,
    year: 2023,
    mileageKm: 8700,
    make: "KTM",
    model: "1290 Super Adventure",
    trim: "S",
    emirate: "RAK",
    city: "Ras Al Khaimah",
    condition: "used",
    engineCc: 1301,
    motoType: "adventure",
    description:
      "Semi-active suspension, radar cruise, full luggage set. Ready for Hatta weekends and beyond.",
    photoCount: 6,
    createdAt: "2026-11-17T09:40:00Z",
    seller: {
      name: "Tariq B.",
      type: "individual",
      since: 2023,
      verified: true,
      phone: "971509876543",
      whatsapp: "971509876543",
    },
  },
  {
    id: "gulf-craft-majesty-62-2020",
    category: "boats",
    title: "Gulf Craft Majesty 62",
    priceAed: 2350000,
    year: 2020,
    mileageKm: null,
    make: "Gulf Craft",
    model: "Majesty 62",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    boatType: "yacht",
    lengthFt: 62,
    engineHours: 480,
    engineType: "Twin MAN inboard",
    description:
      "UAE-built Majesty 62 flybridge yacht. 3 cabins, crew quarters, full navigation suite. Maintained by Gulf Craft service.",
    photoCount: 14,
    featured: true,
    createdAt: "2026-11-23T08:00:00Z",
    seller: {
      name: "Yousef M.",
      type: "dealer",
      since: 2017,
      verified: true,
      phone: "971504455667",
      whatsapp: "971504455667",
      dealerName: "Marina Yachts DXB",
    },
  },
  {
    id: "yamaha-fx-cruiser-2022",
    category: "boats",
    title: "Yamaha WaveRunner FX Cruiser HO",
    priceAed: 52000,
    negotiable: true,
    year: 2022,
    mileageKm: null,
    make: "Yamaha",
    model: "FX Cruiser HO",
    emirate: "RAK",
    city: "Ras Al Khaimah",
    condition: "used",
    boatType: "jetski",
    engineHours: 95,
    engineType: "1.8L High Output",
    description:
      "Three-seater FX Cruiser HO with trailer and covers. Freshwater-flushed after every ride, serviced this season.",
    photoCount: 4,
    createdAt: "2026-11-20T17:30:00Z",
    seller: {
      name: "Hamad S.",
      type: "individual",
      since: 2021,
      verified: true,
      phone: "971507788990",
      whatsapp: "971507788990",
    },
  },
  {
    id: "boston-whaler-330-2019",
    category: "boats",
    title: "Boston Whaler 330 Outrage",
    priceAed: 590000,
    year: 2019,
    mileageKm: null,
    make: "Boston Whaler",
    model: "330 Outrage",
    emirate: "FUJ",
    city: "Fujairah",
    condition: "used",
    boatType: "fishing",
    lengthFt: 33,
    engineHours: 620,
    engineType: "Twin Mercury 300 outboard",
    description:
      "Serious offshore fishing machine based in Fujairah. Outriggers, livewell, Garmin electronics, recently serviced engines.",
    photoCount: 9,
    createdAt: "2026-11-16T13:10:00Z",
    seller: {
      name: "Abdulla F.",
      type: "individual",
      since: 2020,
      verified: false,
      phone: "971503344556",
      whatsapp: "971503344556",
    },
  },
  {
    id: "azimut-55-fly-2021",
    category: "boats",
    title: "Azimut 55 Flybridge",
    priceAed: 3150000,
    year: 2021,
    mileageKm: null,
    make: "Azimut",
    model: "55 Fly",
    emirate: "DXB",
    city: "Dubai",
    condition: "used",
    boatType: "yacht",
    lengthFt: 55,
    engineHours: 310,
    engineType: "Twin Volvo IPS",
    description:
      "Italian luxury flybridge with low hours. Seakeeper stabilizer, hydraulic swim platform, full warranty service records.",
    photoCount: 16,
    urgent: true,
    createdAt: "2026-11-15T19:00:00Z",
    seller: {
      name: "Yousef M.",
      type: "dealer",
      since: 2017,
      verified: true,
      phone: "971504455667",
      whatsapp: "971504455667",
      dealerName: "Marina Yachts DXB",
    },
  },
];

export const POPULAR_MAKES = [
  "Nissan",
  "Toyota",
  "Mercedes-Benz",
  "BMW",
  "Lexus",
  "Porsche",
] as const;

export function getFeaturedListings() {
  return MOCK_LISTINGS.filter((l) => l.featured);
}

export function getLatestListings(count = 6) {
  return [...MOCK_LISTINGS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count);
}

export function getListingById(id: string) {
  return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
}

export function getMakesForCategory(category: VehicleCategoryCode) {
  return [
    ...new Set(
      MOCK_LISTINGS.filter((l) => l.category === category).map((l) => l.make),
    ),
  ].sort();
}
