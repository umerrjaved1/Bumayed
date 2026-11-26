"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { VehicleCategoryCode } from "@/modules/listings/types";

type MakeOpt = {
  id: string;
  nameEn: string;
  models: { id: string; nameEn: string; trims: { id: string; nameEn: string }[] }[];
};

const STEPS = [
  "category",
  "specs",
  "details",
  "price",
  "photos",
  "video",
  "preview",
  "submit",
] as const;

type Step = (typeof STEPS)[number];

const EMIRATES = ["AUH", "DXB", "SHJ", "AJM", "UAQ", "RAK", "FUJ"] as const;

export function ListingWizard() {
  const t = useTranslations("wizard");
  const te = useTranslations("emirates");
  const tf = useTranslations("filters");
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex]!;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);

  const [category, setCategory] = useState<VehicleCategoryCode>("cars");
  const [makes, setMakes] = useState<MakeOpt[]>([]);
  const [cities, setCities] = useState<{ id: string; nameEn: string }[]>([]);
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [trimId, setTrimId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [mileageKm, setMileageKm] = useState("");
  const [transmission, setTransmission] = useState("automatic");
  const [fuelType, setFuelType] = useState("petrol");
  const [regionalSpec, setRegionalSpec] = useState("gcc");
  const [condition, setCondition] = useState("used");
  const [motoType, setMotoType] = useState("cruiser");
  const [boatType, setBoatType] = useState("yacht");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceAed, setPriceAed] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [emirateCode, setEmirateCode] = useState<(typeof EMIRATES)[number]>("DXB");
  const [cityId, setCityId] = useState("");
  const [contactPhone, setContactPhone] = useState("+971");
  const [videoUrl, setVideoUrl] = useState("");

  const models = useMemo(
    () => makes.find((m) => m.id === makeId)?.models ?? [],
    [makes, makeId],
  );
  const trims = useMemo(
    () => models.find((m) => m.id === modelId)?.trims ?? [],
    [models, modelId],
  );

  useEffect(() => {
    fetch(`/api/seller/catalog?category=${category}`)
      .then((r) => r.json())
      .then((d) => setMakes(d.makes ?? []))
      .catch(() => setMakes([]));
  }, [category]);

  useEffect(() => {
    fetch(`/api/seller/catalog?emirate=${emirateCode}`)
      .then((r) => r.json())
      .then((d) => {
        setCities(d.cities ?? []);
        const list: { id: string }[] = d.cities ?? [];
        setCityId((prev) =>
          list.some((c) => c.id === prev) ? prev : list[0]?.id || "",
        );
      })
      .catch(() => setCities([]));
  }, [emirateCode]);

  function buildPayload(submit: boolean) {
    const specs: Record<string, string | number | boolean> = {
      condition: condition.toUpperCase(),
    };
    if (category === "cars") {
      specs.transmission = transmission.toUpperCase();
      specs.fuelType = fuelType.toUpperCase();
      specs.regionalSpec = regionalSpec.toUpperCase();
    }
    if (category === "motorcycles") specs.motorcycleType = motoType;
    if (category === "boats") specs.boatType = boatType;

    return {
      category,
      title,
      description,
      priceAed: Number(priceAed),
      negotiable,
      makeId: makeId || null,
      modelId: modelId || null,
      trimId: trimId || null,
      year: Number(year),
      mileageKm: mileageKm === "" ? null : Number(mileageKm),
      emirateCode,
      cityId,
      specs,
      contactPhone: /^\+[1-9]\d{7,14}$/.test(contactPhone) ? contactPhone : "",
      contactWhatsapp: /^\+[1-9]\d{7,14}$/.test(contactPhone) ? contactPhone : "",
      videoUrl: videoUrl || null,
      submit,
    };
  }

  /** Saves the listing and returns its id, or null when the save failed. */
  async function save(submit: boolean): Promise<string | null> {
    setError(null);
    setPending(true);
    try {
      const payload = buildPayload(submit);
      const res = await fetch(
        listingId ? `/api/seller/listings/${listingId}` : "/api/seller/listings",
        {
          method: listingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? t("error"));
        return null;
      }
      setListingId(data.listing.id);
      if (submit) {
        router.push("/dashboard/listings");
        router.refresh();
      }
      return data.listing.id as string;
    } catch {
      setError(t("error"));
      return null;
    } finally {
      setPending(false);
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    // Ensure draft exists before upload. State updates are async, so use the returned id.
    const id = listingId ?? (await save(false));
    if (!id) return;
    setPending(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch(`/api/seller/listings/${id}/images`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error?.message ?? t("uploadError"));
          break;
        }
        setImages((prev) => [...prev, data.image]);
      }
    } finally {
      setPending(false);
    }
  }

  async function next() {
    setError(null);
    if (step === "details") {
      if (title.trim().length < 8) {
        setError(t("titleTooShort"));
        return;
      }
      if (description.trim().length < 20) {
        setError(t("descriptionTooShort"));
        return;
      }
    }
    if (step === "price") {
      const price = Number(priceAed);
      if (!Number.isInteger(price) || price <= 0) {
        setError(t("priceRequired"));
        return;
      }
      if (!cityId) {
        setError(t("cityRequired"));
        return;
      }
    }
    if (step === "price" || step === "photos") {
      const ok = await save(false);
      if (!ok) return;
    }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("stepOf", { current: stepIndex + 1, total: STEPS.length })} — {t(`steps.${step}`)}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8 space-y-4">
        {step === "category" && (
          <div className="grid gap-2 sm:grid-cols-3">
            {(["cars", "motorcycles", "boats"] as const).map((c) => (
              <Button
                key={c}
                type="button"
                variant={category === c ? "default" : "outline"}
                onClick={() => {
                  setCategory(c);
                  setMakeId("");
                  setModelId("");
                  setTrimId("");
                }}
              >
                {t(`categories.${c}`)}
              </Button>
            ))}
          </div>
        )}

        {step === "specs" && (
          <>
            <Field label={t("make")}>
              <select
                className="flex h-9 w-full rounded-lg border px-3 text-sm"
                value={makeId}
                onChange={(e) => {
                  setMakeId(e.target.value);
                  setModelId("");
                  setTrimId("");
                }}
              >
                <option value="">{t("select")}</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameEn}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("model")}>
              <select
                className="flex h-9 w-full rounded-lg border px-3 text-sm"
                value={modelId}
                onChange={(e) => {
                  setModelId(e.target.value);
                  setTrimId("");
                }}
              >
                <option value="">{t("select")}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameEn}
                  </option>
                ))}
              </select>
            </Field>
            {trims.length > 0 && (
              <Field label={t("trim")}>
                <select
                  className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  value={trimId}
                  onChange={(e) => setTrimId(e.target.value)}
                >
                  <option value="">{t("select")}</option>
                  {trims.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.nameEn}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label={t("year")}>
              <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" />
            </Field>
            {category !== "boats" && (
              <Field label={t("mileage")}>
                <Input
                  value={mileageKm}
                  onChange={(e) => setMileageKm(e.target.value)}
                  type="number"
                />
              </Field>
            )}
            {category === "cars" && (
              <>
                <Field label={t("transmission")}>
                  <select
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                  >
                    <option value="automatic">{t("automatic")}</option>
                    <option value="manual">{t("manual")}</option>
                  </select>
                </Field>
                <Field label={t("fuel")}>
                  <select
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                  >
                    {["petrol", "diesel", "hybrid", "electric"].map((f) => (
                      <option key={f} value={f}>
                        {t(f)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("regional")}>
                  <select
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                    value={regionalSpec}
                    onChange={(e) => setRegionalSpec(e.target.value)}
                  >
                    {["gcc", "american", "european", "japanese"].map((f) => (
                      <option key={f} value={f}>
                        {t(f)}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            {category === "motorcycles" && (
              <Field label={t("motoType")}>
                <select
                  className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  value={motoType}
                  onChange={(e) => setMotoType(e.target.value)}
                >
                  {["sport", "cruiser", "touring", "adventure", "scooter"].map((f) => (
                    <option key={f} value={f}>
                      {tf(f)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {category === "boats" && (
              <Field label={t("boatType")}>
                <select
                  className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  value={boatType}
                  onChange={(e) => setBoatType(e.target.value)}
                >
                  {["yacht", "fishing", "speedboat", "jetski", "sailboat"].map((f) => (
                    <option key={f} value={f}>
                      {tf(f)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label={t("condition")}>
              <select
                className="flex h-9 w-full rounded-lg border px-3 text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="used">{t("used")}</option>
                <option value="new">{t("new")}</option>
              </select>
            </Field>
          </>
        )}

        {step === "details" && (
          <>
            <Field label={t("listingTitle")}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            </Field>
            <Field label={t("description")}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </Field>
          </>
        )}

        {step === "price" && (
          <>
            <Field label={t("price")}>
              <Input
                value={priceAed}
                onChange={(e) => setPriceAed(e.target.value)}
                type="number"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
              />
              {t("negotiable")}
            </label>
            <Field label={t("emirate")}>
              <select
                className="flex h-9 w-full rounded-lg border px-3 text-sm"
                value={emirateCode}
                onChange={(e) =>
                  setEmirateCode(e.target.value as (typeof EMIRATES)[number])
                }
              >
                {EMIRATES.map((c) => (
                  <option key={c} value={c}>
                    {te(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("city")}>
              <select
                className="flex h-9 w-full rounded-lg border px-3 text-sm"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("phone")}>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+9715…"
              />
            </Field>
          </>
        )}

        {step === "photos" && (
          <>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => onUpload(e.target.files)}
            />
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="aspect-video overflow-hidden rounded border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={t("photos")} className="size-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t("photosHint")}</p>
          </>
        )}

        {step === "video" && (
          <Field label={t("videoUrl")}>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="text-xs text-muted-foreground">{t("videoHint")}</p>
          </Field>
        )}

        {(step === "preview" || step === "submit") && (
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <p>
              <strong>{title || "—"}</strong>
            </p>
            <p>
              {t("price")}: AED {priceAed || "—"}
            </p>
            <p>
              {t("emirate")}: {te(emirateCode)}
            </p>
            <p className="line-clamp-4 text-muted-foreground">{description}</p>
            <p>
              {t("photos")}: {images.length}
            </p>
            {step === "submit" && (
              <p className="text-muted-foreground">{t("submitHint")}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={stepIndex === 0 || pending}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          {t("back")}
        </Button>
        {step !== "submit" ? (
          <Button type="button" disabled={pending} onClick={next}>
            {t("next")}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => save(false)}
            >
              {t("saveDraft")}
            </Button>
            <Button type="button" disabled={pending} onClick={() => save(true)}>
              {pending ? t("submitting") : t("submit")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
