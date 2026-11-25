/**
 * Seed script — repeatable and safe for development.
 * Sample accounts use clearly marked passwords (never for production).
 * Run: npm run db:seed  (or prisma migrate reset)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ContentStatus,
  DealerVerificationStatus,
  FieldType,
  ListingStatus,
  Prisma,
  PromotionType,
  Role,
  UserStatus,
  VehicleCategory,
  VideoProvider,
} from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const EMIRATES = [
  { code: "AUH", nameEn: "Abu Dhabi", nameAr: "أبوظبي" },
  { code: "DXB", nameEn: "Dubai", nameAr: "دبي" },
  { code: "SHJ", nameEn: "Sharjah", nameAr: "الشارقة" },
  { code: "AJM", nameEn: "Ajman", nameAr: "عجمان" },
  { code: "UAQ", nameEn: "Umm Al Quwain", nameAr: "أم القيوين" },
  { code: "RAK", nameEn: "Ras Al Khaimah", nameAr: "رأس الخيمة" },
  { code: "FUJ", nameEn: "Fujairah", nameAr: "الفجيرة" },
] as const;

const CITIES: Record<string, { nameEn: string; nameAr: string }[]> = {
  AUH: [
    { nameEn: "Abu Dhabi City", nameAr: "مدينة أبوظبي" },
    { nameEn: "Al Ain", nameAr: "العين" },
  ],
  DXB: [
    { nameEn: "Dubai", nameAr: "دبي" },
    { nameEn: "Jebel Ali", nameAr: "جبل علي" },
  ],
  SHJ: [{ nameEn: "Sharjah City", nameAr: "مدينة الشارقة" }],
  AJM: [{ nameEn: "Ajman City", nameAr: "مدينة عجمان" }],
  UAQ: [{ nameEn: "Umm Al Quwain City", nameAr: "مدينة أم القيوين" }],
  RAK: [{ nameEn: "Ras Al Khaimah City", nameAr: "مدينة رأس الخيمة" }],
  FUJ: [{ nameEn: "Fujairah City", nameAr: "مدينة الفجيرة" }],
};

async function seedLocations() {
  for (const e of EMIRATES) {
    const emirate = await prisma.emirate.upsert({
      where: { code: e.code },
      update: { nameEn: e.nameEn, nameAr: e.nameAr },
      create: e,
    });
    for (const city of CITIES[e.code] ?? []) {
      await prisma.city.upsert({
        where: {
          emirateId_nameEn: { emirateId: emirate.id, nameEn: city.nameEn },
        },
        update: { nameAr: city.nameAr },
        create: { emirateId: emirate.id, ...city },
      });
    }
  }
}

async function seedCatalog() {
  const cars = await prisma.category.upsert({
    where: { code: VehicleCategory.CARS },
    update: {},
    create: {
      code: VehicleCategory.CARS,
      nameEn: "Cars",
      nameAr: "سيارات",
      slug: "cars",
      sortOrder: 1,
    },
  });
  const motorcycles = await prisma.category.upsert({
    where: { code: VehicleCategory.MOTORCYCLES },
    update: {},
    create: {
      code: VehicleCategory.MOTORCYCLES,
      nameEn: "Motorcycles",
      nameAr: "دراجات نارية",
      slug: "motorcycles",
      sortOrder: 2,
    },
  });
  const boats = await prisma.category.upsert({
    where: { code: VehicleCategory.BOATS },
    update: {},
    create: {
      code: VehicleCategory.BOATS,
      nameEn: "Boats",
      nameAr: "قوارب",
      slug: "boats",
      sortOrder: 3,
    },
  });

  const carFields = [
    {
      key: "regionalSpec",
      labelEn: "Regional specification",
      labelAr: "المواصفات الإقليمية",
      fieldType: FieldType.SELECT,
      optionsJson: ["GCC", "AMERICAN", "EUROPEAN", "JAPANESE"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 1,
    },
    {
      key: "bodyType",
      labelEn: "Body type",
      labelAr: "نوع الهيكل",
      fieldType: FieldType.SELECT,
      optionsJson: ["Sedan", "SUV", "Coupe", "Hatchback", "Pickup", "Van"],
      isFilterable: true,
      isRequired: false,
      sortOrder: 2,
    },
    {
      key: "transmission",
      labelEn: "Transmission",
      labelAr: "ناقل الحركة",
      fieldType: FieldType.SELECT,
      optionsJson: ["AUTOMATIC", "MANUAL"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 3,
    },
    {
      key: "fuelType",
      labelEn: "Fuel type",
      labelAr: "نوع الوقود",
      fieldType: FieldType.SELECT,
      optionsJson: ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 4,
    },
    {
      key: "colour",
      labelEn: "Colour",
      labelAr: "اللون",
      fieldType: FieldType.TEXT,
      isFilterable: false,
      isRequired: false,
      sortOrder: 5,
    },
    {
      key: "condition",
      labelEn: "Condition",
      labelAr: "الحالة",
      fieldType: FieldType.SELECT,
      optionsJson: ["NEW", "USED"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 6,
    },
    {
      key: "warranty",
      labelEn: "Warranty",
      labelAr: "ضمان",
      fieldType: FieldType.BOOLEAN,
      isFilterable: false,
      isRequired: false,
      sortOrder: 7,
    },
  ];

  for (const f of carFields) {
    await prisma.categoryField.upsert({
      where: { categoryId_key: { categoryId: cars.id, key: f.key } },
      update: f,
      create: { categoryId: cars.id, ...f },
    });
  }

  for (const f of [
    {
      key: "engineCapacityCc",
      labelEn: "Engine capacity (cc)",
      labelAr: "سعة المحرك (سم³)",
      fieldType: FieldType.NUMBER,
      isFilterable: true,
      isRequired: true,
      sortOrder: 1,
    },
    {
      key: "motorcycleType",
      labelEn: "Motorcycle type",
      labelAr: "نوع الدراجة",
      fieldType: FieldType.SELECT,
      optionsJson: ["sport", "cruiser", "touring", "adventure", "scooter"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 2,
    },
    {
      key: "condition",
      labelEn: "Condition",
      labelAr: "الحالة",
      fieldType: FieldType.SELECT,
      optionsJson: ["NEW", "USED"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 3,
    },
  ]) {
    await prisma.categoryField.upsert({
      where: { categoryId_key: { categoryId: motorcycles.id, key: f.key } },
      update: f,
      create: { categoryId: motorcycles.id, ...f },
    });
  }

  for (const f of [
    {
      key: "boatType",
      labelEn: "Boat type",
      labelAr: "نوع القارب",
      fieldType: FieldType.SELECT,
      optionsJson: ["yacht", "fishing", "speedboat", "jetski", "sailboat"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 1,
    },
    {
      key: "lengthFt",
      labelEn: "Length (ft)",
      labelAr: "الطول (قدم)",
      fieldType: FieldType.NUMBER,
      isFilterable: true,
      isRequired: true,
      sortOrder: 2,
    },
    {
      key: "engineHours",
      labelEn: "Engine hours",
      labelAr: "ساعات المحرك",
      fieldType: FieldType.NUMBER,
      isFilterable: true,
      isRequired: false,
      sortOrder: 3,
    },
    {
      key: "engineType",
      labelEn: "Engine type",
      labelAr: "نوع المحرك",
      fieldType: FieldType.TEXT,
      isFilterable: false,
      isRequired: false,
      sortOrder: 4,
    },
    {
      key: "condition",
      labelEn: "Condition",
      labelAr: "الحالة",
      fieldType: FieldType.SELECT,
      optionsJson: ["NEW", "USED"],
      isFilterable: true,
      isRequired: true,
      sortOrder: 5,
    },
  ]) {
    await prisma.categoryField.upsert({
      where: { categoryId_key: { categoryId: boats.id, key: f.key } },
      update: f,
      create: { categoryId: boats.id, ...f },
    });
  }

  // Top UAE makes (import-friendly — admin can expand later)
  async function ensureMake(
    categoryId: string,
    slug: string,
    nameEn: string,
    nameAr: string | null,
    models: { slug: string; nameEn: string; trims?: string[] }[],
  ) {
    const make = await prisma.vehicleMake.upsert({
      where: { categoryId_slug: { categoryId, slug } },
      update: { nameEn, nameAr, isActive: true },
      create: { categoryId, slug, nameEn, nameAr },
    });
    for (const m of models) {
      const model = await prisma.vehicleModel.upsert({
        where: { makeId_slug: { makeId: make.id, slug: m.slug } },
        update: { nameEn: m.nameEn },
        create: { makeId: make.id, slug: m.slug, nameEn: m.nameEn },
      });
      for (const trim of m.trims ?? []) {
        await prisma.vehicleTrim.upsert({
          where: { modelId_nameEn: { modelId: model.id, nameEn: trim } },
          update: {},
          create: { modelId: model.id, nameEn: trim },
        });
      }
    }
    return make;
  }

  const nissan = await ensureMake(cars.id, "nissan", "Nissan", "نيسان", [
    { slug: "patrol", nameEn: "Patrol", trims: ["Platinum", "SE", "XE"] },
    { slug: "altima", nameEn: "Altima", trims: ["SV", "SL"] },
  ]);
  const toyota = await ensureMake(cars.id, "toyota", "Toyota", "تويوتا", [
    { slug: "land-cruiser", nameEn: "Land Cruiser", trims: ["GXR", "VXR"] },
    { slug: "camry", nameEn: "Camry", trims: ["SE", "XLE"] },
  ]);
  const mercedes = await ensureMake(
    cars.id,
    "mercedes-benz",
    "Mercedes-Benz",
    "مرسيدس-بنز",
    [{ slug: "g-class", nameEn: "G-Class", trims: ["G 63 AMG"] }],
  );
  await ensureMake(cars.id, "bmw", "BMW", "بي إم دبليو", [
    { slug: "x5", nameEn: "X5", trims: ["xDrive40i"] },
  ]);
  await ensureMake(cars.id, "lexus", "Lexus", "لكزس", [
    { slug: "lx", nameEn: "LX", trims: ["570", "600"] },
  ]);

  const harley = await ensureMake(
    motorcycles.id,
    "harley-davidson",
    "Harley-Davidson",
    null,
    [{ slug: "fat-boy", nameEn: "Fat Boy", trims: ["114"] }],
  );
  await ensureMake(motorcycles.id, "yamaha", "Yamaha", "ياماها", [
    { slug: "r1", nameEn: "YZF-R1" },
    { slug: "mt-07", nameEn: "MT-07" },
  ]);

  const yamahaBoat = await ensureMake(boats.id, "yamaha", "Yamaha", "ياماها", [
    { slug: "waverunner", nameEn: "WaveRunner", trims: ["FX Cruiser"] },
  ]);
  const gulfCraft = await ensureMake(
    boats.id,
    "gulf-craft",
    "Gulf Craft",
    "غلف كرافت",
    [{ slug: "majesty-62", nameEn: "Majesty 62" }],
  );

  return {
    cars,
    motorcycles,
    boats,
    nissan,
    toyota,
    mercedes,
    harley,
    yamahaBoat,
    gulfCraft,
  };
}

async function seedCommercialDraft() {
  // DRAFT placeholders — client to confirm (REQUIREMENTS_ANALYSIS Q-2/Q-3)
  for (const row of [
    { type: PromotionType.FEATURED, priceAed: 99, durationDays: 7 },
    { type: PromotionType.PREMIUM, priceAed: 149, durationDays: 15 },
    { type: PromotionType.URGENT, priceAed: 49, durationDays: 3 },
  ]) {
    await prisma.promotionPrice.upsert({
      where: { type: row.type },
      update: row,
      create: row,
    });
  }

  const packages = [
    {
      name: "Basic",
      nameAr: "أساسي",
      priceAed: 299,
      validityDays: 30,
      monthlyListingQuota: null as number | null,
      featuredSlots: 2,
      sortOrder: 1,
    },
    {
      name: "Growth",
      nameAr: "نمو",
      priceAed: 699,
      validityDays: 30,
      monthlyListingQuota: null,
      featuredSlots: 8,
      sortOrder: 2,
    },
    {
      name: "Pro",
      nameAr: "احترافي",
      priceAed: 1499,
      validityDays: 30,
      monthlyListingQuota: null,
      featuredSlots: 20,
      sortOrder: 3,
    },
  ];
  for (const p of packages) {
    const existing = await prisma.package.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.package.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.package.create({ data: p });
    }
  }
}

async function seedContentDraft() {
  for (const page of [
    {
      slug: "about",
      titleEn: "About Bumayed",
      titleAr: "عن بوميّد",
      bodyEn: "DRAFT — About content pending client approval.",
      bodyAr: "مسودة — محتوى من نحن بانتظار موافقة العميل.",
    },
    {
      slug: "faq",
      titleEn: "FAQ",
      titleAr: "الأسئلة الشائعة",
      bodyEn: "DRAFT — FAQ pending client approval.",
      bodyAr: "مسودة — الأسئلة الشائعة بانتظار موافقة العميل.",
    },
    {
      slug: "terms",
      titleEn: "Terms & Conditions",
      titleAr: "الشروط والأحكام",
      bodyEn: "DRAFT — Terms pending client approval.",
      bodyAr: "مسودة — الشروط بانتظار موافقة العميل.",
    },
    {
      slug: "privacy",
      titleEn: "Privacy Policy",
      titleAr: "سياسة الخصوصية",
      bodyEn: "DRAFT — Privacy policy pending client approval.",
      bodyAr: "مسودة — سياسة الخصوصية بانتظار موافقة العميل.",
    },
    {
      slug: "contact",
      titleEn: "Contact",
      titleAr: "اتصل بنا",
      bodyEn: "DRAFT — Contact details pending client approval.",
      bodyAr: "مسودة — بيانات الاتصال بانتظار موافقة العميل.",
    },
  ]) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: { ...page, status: ContentStatus.DRAFT },
      create: { ...page, status: ContentStatus.DRAFT },
    });
  }
}

/** Dev-only sample users — password hashes are placeholders, not real credentials. */
async function seedUsersAndListings(catalog: Awaited<ReturnType<typeof seedCatalog>>) {
  const dxb = await prisma.emirate.findUniqueOrThrow({ where: { code: "DXB" } });
  const auh = await prisma.emirate.findUniqueOrThrow({ where: { code: "AUH" } });
  const shj = await prisma.emirate.findUniqueOrThrow({ where: { code: "SHJ" } });
  const rak = await prisma.emirate.findUniqueOrThrow({ where: { code: "RAK" } });

  const dubaiCity = await prisma.city.findFirstOrThrow({
    where: { emirateId: dxb.id, nameEn: "Dubai" },
  });
  const abuDhabiCity = await prisma.city.findFirstOrThrow({
    where: { emirateId: auh.id, nameEn: "Abu Dhabi City" },
  });
  const sharjahCity = await prisma.city.findFirstOrThrow({
    where: { emirateId: shj.id },
  });
  const rakCity = await prisma.city.findFirstOrThrow({
    where: { emirateId: rak.id },
  });

  const dealer = await prisma.user.upsert({
    where: { email: "dealer.dev@bumayed.local" },
    update: {},
    create: {
      email: "dealer.dev@bumayed.local",
      phone: "+971501112233",
      // DEV ONLY — bcrypt placeholder string, not a real usable password
      passwordHash: "$dev$not-a-real-hash$dealer",
      role: Role.DEALER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Khalid M.",
          emirateId: dxb.id,
          cityId: dubaiCity.id,
          whatsappNumber: "+971501112233",
        },
      },
      dealerProfile: {
        create: {
          businessName: "Emirates Premium Motors",
          slug: "emirates-premium-motors",
          businessPhone: "+971501112233",
          businessEmail: "dealer.dev@bumayed.local",
          whatsappNumber: "+971501112233",
          emirateId: dxb.id,
          cityId: dubaiCity.id,
          description: "DEV SAMPLE dealer — verified for local testing.",
          verificationStatus: DealerVerificationStatus.APPROVED,
          verifiedAt: new Date(),
        },
      },
    },
  });

  const individual = await prisma.user.upsert({
    where: { email: "seller.dev@bumayed.local" },
    update: {},
    create: {
      email: "seller.dev@bumayed.local",
      phone: "+971509998877",
      passwordHash: "$dev$not-a-real-hash$seller",
      role: Role.INDIVIDUAL,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Ahmed R.",
          emirateId: auh.id,
          cityId: abuDhabiCity.id,
          whatsappNumber: "+971509998877",
        },
      },
    },
  });

  const patrol = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.nissan.id, slug: "patrol" },
    include: { trims: true },
  });
  const landCruiser = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.toyota.id, slug: "land-cruiser" },
    include: { trims: true },
  });
  const gClass = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.mercedes.id, slug: "g-class" },
    include: { trims: true },
  });
  const fatBoy = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.harley.id, slug: "fat-boy" },
    include: { trims: true },
  });
  const waverunner = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.yamahaBoat.id, slug: "waverunner" },
    include: { trims: true },
  });
  const majesty = await prisma.vehicleModel.findFirstOrThrow({
    where: { makeId: catalog.gulfCraft.id, slug: "majesty-62" },
  });

  type SeedListing = {
    slug: string;
    sellerId: string;
    categoryId: string;
    title: string;
    description: string;
    priceAed: number;
    negotiable?: boolean;
    makeId: string;
    modelId: string;
    trimId?: string;
    year: number;
    mileageKm: number | null;
    emirateId: string;
    cityId: string;
    specs: Prisma.InputJsonValue;
    video?: { provider: VideoProvider; originalUrl: string; embedUrl?: string };
  };

  const samples: SeedListing[] = [
    {
      slug: "nissan-patrol-platinum-2023",
      sellerId: dealer.id,
      categoryId: catalog.cars.id,
      title: "Nissan Patrol Platinum V8",
      description:
        "GCC-spec Nissan Patrol Platinum in excellent condition. Full service history at the agency, single owner, no accidents.",
      priceAed: 245000,
      makeId: catalog.nissan.id,
      modelId: patrol.id,
      trimId: patrol.trims.find((t) => t.nameEn === "Platinum")?.id,
      year: 2023,
      mileageKm: 18500,
      emirateId: dxb.id,
      cityId: dubaiCity.id,
      specs: {
        regionalSpec: "GCC",
        bodyType: "SUV",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        colour: "White",
        condition: "USED",
        warranty: true,
      },
      video: {
        provider: VideoProvider.YOUTUBE,
        originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    },
    {
      slug: "toyota-land-cruiser-gxr-2022",
      sellerId: dealer.id,
      categoryId: catalog.cars.id,
      title: "Toyota Land Cruiser GXR",
      description: "Well-maintained Land Cruiser GXR, agency maintained, clean title.",
      priceAed: 189000,
      negotiable: true,
      makeId: catalog.toyota.id,
      modelId: landCruiser.id,
      trimId: landCruiser.trims.find((t) => t.nameEn === "GXR")?.id,
      year: 2022,
      mileageKm: 42000,
      emirateId: auh.id,
      cityId: abuDhabiCity.id,
      specs: {
        regionalSpec: "GCC",
        bodyType: "SUV",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        colour: "Pearl White",
        condition: "USED",
        warranty: false,
      },
    },
    {
      slug: "mercedes-g63-amg-2024",
      sellerId: dealer.id,
      categoryId: catalog.cars.id,
      title: "Mercedes-Benz G 63 AMG",
      description: "Nearly new G 63 AMG with low mileage. Night package, Burmester sound.",
      priceAed: 615000,
      makeId: catalog.mercedes.id,
      modelId: gClass.id,
      trimId: gClass.trims[0]?.id,
      year: 2024,
      mileageKm: 5500,
      emirateId: dxb.id,
      cityId: dubaiCity.id,
      specs: {
        regionalSpec: "EUROPEAN",
        bodyType: "SUV",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        colour: "Obsidian Black",
        condition: "USED",
        warranty: true,
      },
    },
    {
      slug: "harley-fat-boy-114-2021",
      sellerId: individual.id,
      categoryId: catalog.motorcycles.id,
      title: "Harley-Davidson Fat Boy 114",
      description: "Cruiser in great shape. Milwaukee-Eight 114, Vance & Hines exhaust.",
      priceAed: 78000,
      makeId: catalog.harley.id,
      modelId: fatBoy.id,
      trimId: fatBoy.trims[0]?.id,
      year: 2021,
      mileageKm: 9300,
      emirateId: shj.id,
      cityId: sharjahCity.id,
      specs: {
        engineCapacityCc: 1868,
        motorcycleType: "cruiser",
        condition: "USED",
      },
    },
    {
      slug: "yamaha-waverunner-fx-2022",
      sellerId: individual.id,
      categoryId: catalog.boats.id,
      title: "Yamaha WaveRunner FX Cruiser",
      description: "Jet ski ready for the season. Fresh service, cover included.",
      priceAed: 52000,
      negotiable: true,
      makeId: catalog.yamahaBoat.id,
      modelId: waverunner.id,
      trimId: waverunner.trims[0]?.id,
      year: 2022,
      mileageKm: null,
      emirateId: rak.id,
      cityId: rakCity.id,
      specs: {
        boatType: "jetski",
        lengthFt: 12,
        engineHours: 120,
        engineType: "4-stroke",
        condition: "USED",
      },
    },
    {
      slug: "gulf-craft-majesty-62-2020",
      sellerId: dealer.id,
      categoryId: catalog.boats.id,
      title: "Gulf Craft Majesty 62",
      description: "Luxury motor yacht, UAE-built. Full options, berth available separately.",
      priceAed: 2350000,
      makeId: catalog.gulfCraft.id,
      modelId: majesty.id,
      year: 2020,
      mileageKm: null,
      emirateId: dxb.id,
      cityId: dubaiCity.id,
      specs: {
        boatType: "yacht",
        lengthFt: 62,
        engineHours: 980,
        engineType: "Twin diesel",
        condition: "USED",
      },
    },
  ];

  for (const s of samples) {
    const listing = await prisma.listing.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        description: s.description,
        priceAed: s.priceAed,
        negotiable: s.negotiable ?? false,
        year: s.year,
        mileageKm: s.mileageKm,
        specs: s.specs,
        status: ListingStatus.ACTIVE,
        approvedAt: new Date(),
        contactPhone:
          s.sellerId === dealer.id ? "+971501112233" : "+971509998877",
        contactWhatsapp:
          s.sellerId === dealer.id ? "+971501112233" : "+971509998877",
      },
      create: {
        sellerId: s.sellerId,
        categoryId: s.categoryId,
        status: ListingStatus.ACTIVE,
        title: s.title,
        slug: s.slug,
        description: s.description,
        priceAed: s.priceAed,
        negotiable: s.negotiable ?? false,
        makeId: s.makeId,
        modelId: s.modelId,
        trimId: s.trimId,
        year: s.year,
        mileageKm: s.mileageKm,
        emirateId: s.emirateId,
        cityId: s.cityId,
        specs: s.specs,
        approvedAt: new Date(),
        submittedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        contactPhone:
          s.sellerId === dealer.id ? "+971501112233" : "+971509998877",
        contactWhatsapp:
          s.sellerId === dealer.id ? "+971501112233" : "+971509998877",
        images: {
          create: [
            {
              objectKey: `seed/${s.slug}/1.jpg`,
              sortOrder: 0,
              isPrimary: true,
              mime: "image/jpeg",
            },
          ],
        },
        video: s.video
          ? {
              create: {
                provider: s.video.provider,
                originalUrl: s.video.originalUrl,
                embedUrl: s.video.embedUrl,
              },
            }
          : undefined,
      },
    });

    // Featured promotions for a couple of listings
    if (
      s.slug === "nissan-patrol-platinum-2023" ||
      s.slug === "gulf-craft-majesty-62-2020"
    ) {
      const existing = await prisma.featuredPromotion.findFirst({
        where: {
          listingId: listing.id,
          type: PromotionType.FEATURED,
          status: "ACTIVE",
        },
      });
      if (!existing) {
        await prisma.featuredPromotion.create({
          data: {
            listingId: listing.id,
            type: PromotionType.FEATURED,
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  console.log("Seeded DEV sample accounts:");
  console.log("  dealer.dev@bumayed.local  (role: DEALER) — DEV ONLY");
  console.log("  seller.dev@bumayed.local  (role: INDIVIDUAL) — DEV ONLY");
}

async function main() {
  console.log("Seeding Bumayed…");
  await seedLocations();
  const catalog = await seedCatalog();
  await seedCommercialDraft();
  await seedContentDraft();
  await seedUsersAndListings(catalog);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
