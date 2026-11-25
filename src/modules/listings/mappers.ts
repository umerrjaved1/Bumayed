import type {
  Category,
  DealerProfile,
  FeaturedPromotion,
  Listing,
  ListingImage,
  ListingVideo,
  PromotionType,
  User,
  UserProfile,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
  Emirate,
  City,
} from "@/generated/prisma/client";
import {
  CATEGORY_ENUM_TO_CODE,
  type EmirateCode,
  type ListingPublicDto,
  type VehicleCategoryCode,
} from "./types";

type ListingRow = Listing & {
  category: Category;
  make: VehicleMake | null;
  model: VehicleModel | null;
  trim: VehicleTrim | null;
  emirate: Emirate;
  city: City;
  images: ListingImage[];
  video: ListingVideo | null;
  promotions: Pick<FeaturedPromotion, "type" | "status" | "endsAt">[];
  seller: User & {
    profile: UserProfile | null;
    dealerProfile: DealerProfile | null;
  };
};

function lower(v: unknown): string | undefined {
  return typeof v === "string" ? v.toLowerCase() : undefined;
}

function activePromo(
  promotions: ListingRow["promotions"],
  type: PromotionType,
): boolean {
  const now = Date.now();
  return promotions.some(
    (p) =>
      p.type === type &&
      p.status === "ACTIVE" &&
      new Date(p.endsAt).getTime() > now,
  );
}

export function toPublicDto(row: ListingRow): ListingPublicDto {
  const specs = (row.specs ?? {}) as Record<string, unknown>;
  const category = CATEGORY_ENUM_TO_CODE[
    row.category.code
  ] as VehicleCategoryCode;

  const dealer = row.seller.dealerProfile;
  const isDealer = row.seller.role === "DEALER" && !!dealer;
  const phone =
    (row.contactPhone ??
      dealer?.businessPhone ??
      row.seller.profile?.whatsappNumber ??
      row.seller.phone ??
      "").replace(/^\+/, "");
  const whatsapp =
    (row.contactWhatsapp ??
      dealer?.whatsappNumber ??
      row.seller.profile?.whatsappNumber ??
      phone).replace(/^\+/, "");

  return {
    id: row.id,
    slug: row.slug,
    category,
    title: row.title,
    priceAed: row.priceAed,
    negotiable: row.negotiable,
    year: row.year ?? 0,
    mileageKm: row.mileageKm,
    make: row.make?.nameEn ?? "",
    model: row.model?.nameEn ?? "",
    trim: row.trim?.nameEn,
    emirate: row.emirate.code as EmirateCode,
    city: row.city.nameEn,
    condition: (lower(specs.condition) as "new" | "used") ?? "used",
    description: row.description,
    photoCount: row.images.length,
    videoUrl: row.video?.originalUrl,
    featured: activePromo(row.promotions, "FEATURED"),
    urgent: activePromo(row.promotions, "URGENT"),
    premium: activePromo(row.promotions, "PREMIUM"),
    createdAt: row.createdAt.toISOString(),
    transmission: lower(specs.transmission) as ListingPublicDto["transmission"],
    fuelType: lower(specs.fuelType) as ListingPublicDto["fuelType"],
    regionalSpec: lower(specs.regionalSpec) as ListingPublicDto["regionalSpec"],
    bodyType: typeof specs.bodyType === "string" ? specs.bodyType : undefined,
    colour: typeof specs.colour === "string" ? specs.colour : undefined,
    warranty: typeof specs.warranty === "boolean" ? specs.warranty : undefined,
    engineCc:
      typeof specs.engineCapacityCc === "number"
        ? specs.engineCapacityCc
        : undefined,
    motoType: (lower(specs.motorcycleType) ??
      lower(specs.motoType)) as ListingPublicDto["motoType"],
    boatType: lower(specs.boatType) as ListingPublicDto["boatType"],
    lengthFt: typeof specs.lengthFt === "number" ? specs.lengthFt : undefined,
    engineHours:
      typeof specs.engineHours === "number" ? specs.engineHours : undefined,
    engineType:
      typeof specs.engineType === "string" ? specs.engineType : undefined,
    seller: {
      name: row.seller.profile?.displayName ?? "Seller",
      type: isDealer ? "dealer" : "individual",
      since: row.seller.createdAt.getFullYear(),
      verified: isDealer
        ? dealer?.verificationStatus === "APPROVED"
        : !!row.seller.emailVerifiedAt,
      phone,
      whatsapp,
      dealerName: dealer?.businessName,
    },
  };
}
