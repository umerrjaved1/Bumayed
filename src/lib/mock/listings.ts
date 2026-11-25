/**
 * ⚠️ ISOLATED MOCK FIXTURES — VISUAL PROTOTYPING ONLY (playbook rule 9).
 * Used solely to demo the design system during Phase 1/2.
 * Replace with real API data in Phase 3. Never ship to production paths.
 * Delete this file once the listings module is integrated.
 */

export type MockListing = {
  id: string;
  title: string;
  priceAed: number;
  year: number;
  mileageKm: number | null;
  emirate: "AUH" | "DXB" | "SHJ" | "AJM" | "UAQ" | "RAK" | "FUJ";
  category: "cars" | "motorcycles" | "boats";
  featured?: boolean;
  urgent?: boolean;
  negotiable?: boolean;
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "mock-1",
    title: "Nissan Patrol Platinum V8",
    priceAed: 245000,
    year: 2023,
    mileageKm: 18500,
    emirate: "DXB",
    category: "cars",
    featured: true,
  },
  {
    id: "mock-2",
    title: "Toyota Land Cruiser GXR",
    priceAed: 189000,
    year: 2022,
    mileageKm: 42000,
    emirate: "AUH",
    category: "cars",
    featured: true,
    negotiable: true,
  },
  {
    id: "mock-3",
    title: "Mercedes-Benz G 63 AMG",
    priceAed: 615000,
    year: 2024,
    mileageKm: 5500,
    emirate: "DXB",
    category: "cars",
  },
  {
    id: "mock-4",
    title: "Harley-Davidson Fat Boy 114",
    priceAed: 78000,
    year: 2021,
    mileageKm: 9300,
    emirate: "SHJ",
    category: "motorcycles",
    urgent: true,
  },
  {
    id: "mock-5",
    title: "Yamaha WaveRunner FX Cruiser",
    priceAed: 52000,
    year: 2022,
    mileageKm: null,
    emirate: "RAK",
    category: "boats",
    negotiable: true,
  },
  {
    id: "mock-6",
    title: "Gulf Craft Majesty 62",
    priceAed: 2350000,
    year: 2020,
    mileageKm: null,
    emirate: "DXB",
    category: "boats",
    featured: true,
  },
];
