"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export type DealerDashboardData = {
  profile: {
    id: string;
    businessName: string;
    businessPhone: string;
    businessEmail: string | null;
    whatsappNumber: string | null;
    address: string | null;
    description: string | null;
    workingHours: string | null;
    verificationStatus: string;
    verifiedAt: string | null;
    verificationNote: string | null;
    emirate?: { nameEn: string } | null;
    city?: { nameEn: string } | null;
  } | null;
  inventory: {
    total: number;
    active: number;
    pending: number;
    paused: number;
    sold: number;
    expired: number;
  };
  subscription: {
    endsAt: string;
    listingsUsedThisPeriod: number;
    featuredSlotsUsed: number;
    package: {
      name: string;
      monthlyListingQuota: number | null;
      featuredSlots: number;
    };
  } | null;
};

export function DealerDashboardClient({
  initial,
}: {
  initial: DealerDashboardData;
}) {
  const t = useTranslations("dealerDashboard");
  const [data, setData] = useState(initial);
  const [pending, startTransition] = useTransition();
  const profile = data.profile;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      businessName: String(fd.get("businessName") ?? ""),
      businessPhone: String(fd.get("businessPhone") ?? ""),
      businessEmail: String(fd.get("businessEmail") ?? "") || null,
      whatsappNumber: String(fd.get("whatsappNumber") ?? "") || null,
      address: String(fd.get("address") ?? "") || null,
      description: String(fd.get("description") ?? "") || null,
      workingHours: String(fd.get("workingHours") ?? "") || null,
    };
    const res = await fetch("/api/dealer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error(t("saveError"));
      return;
    }
    const body = await res.json();
    toast.success(t("saveOk"));
    startTransition(() => {
      setData((prev) => ({
        ...prev,
        profile: {
          ...body.profile,
          verifiedAt: body.profile.verifiedAt
            ? new Date(body.profile.verifiedAt).toISOString()
            : null,
        },
      }));
    });
  }

  if (!profile) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        {t("noProfile")}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["total", data.inventory.total],
            ["active", data.inventory.active],
            ["pending", data.inventory.pending],
            ["sold", data.inventory.sold],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{t(`stats.${key}`)}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{t("verification")}</h2>
          <Badge variant="secondary">{profile.verificationStatus}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("verificationHint")}
        </p>
        {profile.verificationNote ? (
          <p className="mt-2 text-sm">{profile.verificationNote}</p>
        ) : null}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">{t("package")}</h2>
        {data.subscription ? (
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>
              {data.subscription.package.name} · {t("renews")}{" "}
              {new Date(data.subscription.endsAt).toLocaleDateString()}
            </p>
            <p>
              {t("slotsUsed", {
                used: data.subscription.featuredSlotsUsed,
                total: data.subscription.package.featuredSlots,
              })}
            </p>
            <p>
              {data.subscription.package.monthlyListingQuota == null
                ? t("unlimitedListings")
                : t("quotaUsed", {
                    used: data.subscription.listingsUsedThisPeriod,
                    total: data.subscription.package.monthlyListingQuota,
                  })}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{t("noPackage")}</p>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t("businessProfile")}</h2>
          <Button variant="outline" render={<Link href="/dashboard/listings" />}>
            {t("manageInventory")}
          </Button>
        </div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">{t("businessName")}</Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={profile.businessName}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessPhone">{t("businessPhone")}</Label>
            <Input
              id="businessPhone"
              name="businessPhone"
              defaultValue={profile.businessPhone}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessEmail">{t("businessEmail")}</Label>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              defaultValue={profile.businessEmail ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsappNumber">{t("whatsapp")}</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={profile.whatsappNumber ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Input
              id="address"
              name="address"
              defaultValue={profile.address ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="workingHours">{t("workingHours")}</Label>
            <Input
              id="workingHours"
              name="workingHours"
              defaultValue={profile.workingHours ?? ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={profile.description ?? ""}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {t("save")}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
