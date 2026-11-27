/**
 * First-level regions and main cities for the five GCC countries beyond the
 * UAE (UAE emirates are seeded separately and already live). Plain data so
 * the seed and the tests share it.
 *
 * Region codes are 3 letters and must be unique across ALL countries (they
 * appear in URLs such as ?emirate=RUH). A test enforces that.
 * Arabic names should be reviewed by a native speaker before launch.
 */
import type { GccCode } from "@/lib/gcc";

export type SeedCity = { nameEn: string; nameAr: string };
export type SeedRegion = {
  code: string;
  nameEn: string;
  nameAr: string;
  cities: SeedCity[];
};

export const GCC_REGIONS: Record<Exclude<GccCode, "AE">, SeedRegion[]> = {
  SA: [
    { code: "RUH", nameEn: "Riyadh", nameAr: "الرياض", cities: [
      { nameEn: "Riyadh", nameAr: "الرياض" }, { nameEn: "Al Kharj", nameAr: "الخرج" },
    ] },
    { code: "MKK", nameEn: "Makkah", nameAr: "مكة المكرمة", cities: [
      { nameEn: "Jeddah", nameAr: "جدة" }, { nameEn: "Makkah", nameAr: "مكة المكرمة" }, { nameEn: "Taif", nameAr: "الطائف" },
    ] },
    { code: "MED", nameEn: "Madinah", nameAr: "المدينة المنورة", cities: [
      { nameEn: "Madinah", nameAr: "المدينة المنورة" }, { nameEn: "Yanbu", nameAr: "ينبع" },
    ] },
    { code: "EAS", nameEn: "Eastern Province", nameAr: "المنطقة الشرقية", cities: [
      { nameEn: "Dammam", nameAr: "الدمام" }, { nameEn: "Khobar", nameAr: "الخبر" }, { nameEn: "Dhahran", nameAr: "الظهران" },
      { nameEn: "Jubail", nameAr: "الجبيل" }, { nameEn: "Hofuf", nameAr: "الهفوف" },
    ] },
    { code: "QAS", nameEn: "Qassim", nameAr: "القصيم", cities: [
      { nameEn: "Buraydah", nameAr: "بريدة" }, { nameEn: "Unaizah", nameAr: "عنيزة" },
    ] },
    { code: "ASR", nameEn: "Asir", nameAr: "عسير", cities: [
      { nameEn: "Abha", nameAr: "أبها" }, { nameEn: "Khamis Mushait", nameAr: "خميس مشيط" },
    ] },
    { code: "TBK", nameEn: "Tabuk", nameAr: "تبوك", cities: [{ nameEn: "Tabuk", nameAr: "تبوك" }] },
    { code: "HAL", nameEn: "Hail", nameAr: "حائل", cities: [{ nameEn: "Hail", nameAr: "حائل" }] },
    { code: "NBR", nameEn: "Northern Borders", nameAr: "الحدود الشمالية", cities: [{ nameEn: "Arar", nameAr: "عرعر" }] },
    { code: "JZN", nameEn: "Jazan", nameAr: "جازان", cities: [{ nameEn: "Jazan", nameAr: "جازان" }] },
    { code: "NJR", nameEn: "Najran", nameAr: "نجران", cities: [{ nameEn: "Najran", nameAr: "نجران" }] },
    { code: "BAH", nameEn: "Al Bahah", nameAr: "الباحة", cities: [{ nameEn: "Al Bahah", nameAr: "الباحة" }] },
    { code: "JOF", nameEn: "Al Jouf", nameAr: "الجوف", cities: [{ nameEn: "Sakaka", nameAr: "سكاكا" }] },
  ],
  QA: [
    { code: "DOH", nameEn: "Doha", nameAr: "الدوحة", cities: [{ nameEn: "Doha", nameAr: "الدوحة" }] },
    { code: "RYN", nameEn: "Al Rayyan", nameAr: "الريان", cities: [{ nameEn: "Al Rayyan", nameAr: "الريان" }] },
    { code: "WKR", nameEn: "Al Wakrah", nameAr: "الوكرة", cities: [{ nameEn: "Al Wakrah", nameAr: "الوكرة" }] },
    { code: "KHR", nameEn: "Al Khor", nameAr: "الخور", cities: [{ nameEn: "Al Khor", nameAr: "الخور" }] },
    { code: "SHM", nameEn: "Al Shamal", nameAr: "الشمال", cities: [{ nameEn: "Madinat Ash Shamal", nameAr: "مدينة الشمال" }] },
    { code: "DAY", nameEn: "Al Daayen", nameAr: "الضعاين", cities: [{ nameEn: "Lusail", nameAr: "لوسيل" }] },
    { code: "UMS", nameEn: "Umm Salal", nameAr: "أم صلال", cities: [{ nameEn: "Umm Salal Mohammed", nameAr: "أم صلال محمد" }] },
    { code: "SHH", nameEn: "Al Shahaniya", nameAr: "الشحانية", cities: [{ nameEn: "Al Shahaniya", nameAr: "الشحانية" }] },
  ],
  KW: [
    { code: "KWC", nameEn: "Capital", nameAr: "العاصمة", cities: [{ nameEn: "Kuwait City", nameAr: "مدينة الكويت" }] },
    { code: "HAW", nameEn: "Hawalli", nameAr: "حولي", cities: [
      { nameEn: "Hawalli", nameAr: "حولي" }, { nameEn: "Salmiya", nameAr: "السالمية" },
    ] },
    { code: "FRW", nameEn: "Farwaniya", nameAr: "الفروانية", cities: [{ nameEn: "Farwaniya", nameAr: "الفروانية" }] },
    { code: "AHM", nameEn: "Ahmadi", nameAr: "الأحمدي", cities: [
      { nameEn: "Ahmadi", nameAr: "الأحمدي" }, { nameEn: "Fahaheel", nameAr: "الفحيحيل" },
    ] },
    { code: "JHR", nameEn: "Jahra", nameAr: "الجهراء", cities: [{ nameEn: "Jahra", nameAr: "الجهراء" }] },
    { code: "MBK", nameEn: "Mubarak Al-Kabeer", nameAr: "مبارك الكبير", cities: [{ nameEn: "Sabah Al-Salem", nameAr: "صباح السالم" }] },
  ],
  BH: [
    { code: "BHC", nameEn: "Capital", nameAr: "العاصمة", cities: [{ nameEn: "Manama", nameAr: "المنامة" }] },
    { code: "BHM", nameEn: "Muharraq", nameAr: "المحرق", cities: [{ nameEn: "Muharraq", nameAr: "المحرق" }] },
    { code: "BHN", nameEn: "Northern", nameAr: "الشمالية", cities: [{ nameEn: "Hamad Town", nameAr: "مدينة حمد" }] },
    { code: "BHS", nameEn: "Southern", nameAr: "الجنوبية", cities: [
      { nameEn: "Riffa", nameAr: "الرفاع" }, { nameEn: "Isa Town", nameAr: "مدينة عيسى" },
    ] },
  ],
  OM: [
    { code: "MCT", nameEn: "Muscat", nameAr: "مسقط", cities: [
      { nameEn: "Muscat", nameAr: "مسقط" }, { nameEn: "Seeb", nameAr: "السيب" }, { nameEn: "Bawshar", nameAr: "بوشر" },
    ] },
    { code: "DHF", nameEn: "Dhofar", nameAr: "ظفار", cities: [{ nameEn: "Salalah", nameAr: "صلالة" }] },
    { code: "BAT", nameEn: "Al Batinah North", nameAr: "شمال الباطنة", cities: [{ nameEn: "Sohar", nameAr: "صحار" }] },
    { code: "BAS", nameEn: "Al Batinah South", nameAr: "جنوب الباطنة", cities: [{ nameEn: "Rustaq", nameAr: "الرستاق" }] },
    { code: "DAH", nameEn: "Ad Dakhiliyah", nameAr: "الداخلية", cities: [{ nameEn: "Nizwa", nameAr: "نزوى" }] },
    { code: "DHA", nameEn: "Ad Dhahirah", nameAr: "الظاهرة", cities: [{ nameEn: "Ibri", nameAr: "عبري" }] },
    { code: "SHR", nameEn: "Ash Sharqiyah North", nameAr: "شمال الشرقية", cities: [{ nameEn: "Ibra", nameAr: "إبراء" }] },
    { code: "SHS", nameEn: "Ash Sharqiyah South", nameAr: "جنوب الشرقية", cities: [{ nameEn: "Sur", nameAr: "صور" }] },
    { code: "BUR", nameEn: "Al Buraimi", nameAr: "البريمي", cities: [{ nameEn: "Al Buraimi", nameAr: "البريمي" }] },
    { code: "WUS", nameEn: "Al Wusta", nameAr: "الوسطى", cities: [{ nameEn: "Haima", nameAr: "هيماء" }] },
    { code: "MUS", nameEn: "Musandam", nameAr: "مسندم", cities: [{ nameEn: "Khasab", nameAr: "خصب" }] },
  ],
};

/** The UAE's seven emirates (already live; listed so uniqueness is checked too). */
export const UAE_REGION_CODES = ["AUH", "DXB", "SHJ", "AJM", "UAQ", "RAK", "FUJ"] as const;
