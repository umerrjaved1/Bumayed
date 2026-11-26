"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Page = {
  slug: string;
  status: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

export function ContentEditor({
  pages,
}: {
  pages: Page[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(pages[0]?.slug ?? "");
  const current = pages.find((p) => p.slug === slug) ?? pages[0];
  const [busy, setBusy] = useState(false);

  async function save(form: FormData) {
    if (!current) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: current.slug,
          titleEn: String(form.get("titleEn") ?? ""),
          titleAr: String(form.get("titleAr") ?? ""),
          bodyEn: String(form.get("bodyEn") ?? ""),
          bodyAr: String(form.get("bodyAr") ?? ""),
          status: String(form.get("status") ?? current.status),
        }),
      });
      if (!res.ok) {
        toast.error("Could not save page");
        return;
      }
      toast.success("Page saved");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addBanner(form: FormData) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: String(form.get("titleEn") ?? ""),
          titleAr: String(form.get("titleAr") ?? ""),
          imageKey: String(form.get("imageKey") ?? ""),
          linkUrl: String(form.get("linkUrl") ?? ""),
          position: String(form.get("position") ?? "home_hero"),
          width: Number(form.get("width") || 1200),
          height: Number(form.get("height") || 400),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error?.message ?? "Could not save banner");
        return;
      }
      toast.success("Banner saved");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!current) return null;

  return (
    <div className="space-y-10">
      <form action={save} className="space-y-3 rounded-lg border p-4" key={current.slug}>
        <Label htmlFor="page">Page</Label>
        <select
          id="page"
          className="h-10 rounded-md border bg-background px-2"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.slug} ({p.status})
            </option>
          ))}
        </select>
        <Input name="titleEn" defaultValue={current.titleEn} required />
        <Input name="titleAr" defaultValue={current.titleAr} required />
        <Textarea name="bodyEn" defaultValue={current.bodyEn} rows={6} required />
        <Textarea name="bodyAr" defaultValue={current.bodyAr} rows={6} required />
        <select name="status" defaultValue={current.status} className="h-10 rounded-md border px-2">
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
        <Button type="submit" disabled={busy}>
          Save page
        </Button>
      </form>

      <form action={addBanner} className="space-y-3 rounded-lg border p-4">
        <h2 className="font-semibold">New banner</h2>
        <Input name="titleEn" placeholder="Title" required />
        <Input name="titleAr" placeholder="العنوان" />
        <Input name="imageKey" placeholder="Image key or URL" required />
        <Input name="linkUrl" placeholder="https://..." />
        <Input name="position" defaultValue="home_hero" />
        <div className="flex gap-2">
          <Input name="width" type="number" defaultValue={1200} />
          <Input name="height" type="number" defaultValue={400} />
        </div>
        <Button type="submit" disabled={busy}>
          Add banner
        </Button>
      </form>
    </div>
  );
}
