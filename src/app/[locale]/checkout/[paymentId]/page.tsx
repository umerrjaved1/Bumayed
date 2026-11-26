"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function CheckoutPage() {
  const params = useParams<{ paymentId: string }>();
  const t = useTranslations("checkout");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function simulate(outcome: "success" | "fail" | "cancel" | "refund") {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: params.paymentId, outcome }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error?.message ?? t("error"));
        return;
      }
      setResult(body.action ?? "ok");
      toast.success(t("recorded"));
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
      <h1 className="mt-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("body")}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void simulate("success")}>
          {t("success")}
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void simulate("fail")}>
          {t("fail")}
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void simulate("cancel")}>
          {t("cancel")}
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => void simulate("refund")}>
          {t("refund")}
        </Button>
      </div>
      {result ? (
        <p className="mt-4 text-sm">
          {t("result")}: {result}
        </p>
      ) : null}
      <Button className="mt-8" variant="ghost" render={<Link href="/dashboard" />}>
        {t("back")}
      </Button>
    </div>
  );
}
