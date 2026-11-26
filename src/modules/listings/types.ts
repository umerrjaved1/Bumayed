/** Public DTOs + query types shared by UI, API and services. */

export type EmirateCode = "AUH" | "DXB" | "SHJ" | "AJM" | "UAQ" | "RAK" | "FUJ";
export type VehicleCategoryCode = "cars" | "motorcycles" | "boats";

export type ListingSellerDto = {
  name: string;
  type: "individual" | "dealer";
  since: number;
  verified: boolean;
  phone: string;
  whatsapp: string;
  dealerName?: string;
};

/** Card + detail shape used by the public UI (replaces MockListing). */
export type ListingPublicDto = {
  id: string;
  slug: string;
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
  /** Arabic city name, shown on Arabic pages. */
  cityAr: string;
  condition: "new" | "used";
  description: string;
    photoCount: number;
    photos: string[];
  videoUrl?: string;
  featured?: boolean;
  urgent?: boolean;
  premium?: boolean;
  createdAt: string;
  transmission?: "automatic" | "manual";
  fuelType?: "petrol" | "diesel" | "hybrid" | "electric";
  regionalSpec?: "gcc" | "american" | "european" | "japanese";
  bodyType?: string;
  colour?: string;
  warranty?: boolean;
  engineCc?: number;
  motoType?: "sport" | "cruiser" | "touring" | "adventure" | "scooter";
  boatType?: "yacht" | "fishing" | "speedboat" | "jetski" | "sailboat";
  lengthFt?: number;
  engineHours?: number;
  engineType?: string;
  seller: ListingSellerDto;
};

export type ListingSort =
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "mileageAsc"
  | "yearDesc";

export type ListingQuery = {
  category: VehicleCategoryCode;
  keyword?: string;
  make?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  emirate?: string;
  condition?: "new" | "used";
  sellerType?: "individual" | "dealer";
  transmission?: string;
  fuelType?: string;
  regionalSpec?: string;
  motoType?: string;
  boatType?: string;
  sort: ListingSort;
  page: number;
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export const PAGE_SIZE = 9;

export const CATEGORY_CODE_TO_ENUM = {
  cars: "CARS",
  motorcycles: "MOTORCYCLES",
  boats: "BOATS",
} as const;

export const CATEGORY_ENUM_TO_CODE = {
  CARS: "cars",
  MOTORCYCLES: "motorcycles",
  BOATS: "boats",
} as const;
