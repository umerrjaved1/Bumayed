"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = ["fraud", "wrongCategory", "duplicate", "prohibited", "other"] as const;

export function ReportDialog({
  listingId,
  requireGuestContact = false,
  triggerClassName,
  labelClassName,
}: {
  listingId: string;
  requireGuestContact?: boolean;
  triggerClassName?: string;
  /** Lets a tight layout hide the visible label (it stays for screen readers). */
  labelClassName?: string;
}) {
  const t = useTranslations("detail");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason,
          details: details.trim() || undefined,
          guestContact: guestContact.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error?.message ?? t("reportError"));
        return;
      }
      toast.success(t("reportOk"));
      setOpen(false);
      setReason("");
      setDetails("");
      setGuestContact("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-muted-foreground", triggerClassName)}
          />
        }
      >
        <Flag className="size-4" aria-hidden />
        <span className={labelClassName}>{t("report")}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportTitle")}</DialogTitle>
          <DialogDescription>{t("reportDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="report-reason">{t("reportReason")}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v ?? "")}>
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder={t("reportReasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`reportReasons.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {requireGuestContact ? (
            <div className="space-y-1.5">
              <Label htmlFor="report-contact">{t("reportContact")}</Label>
              <Input
                id="report-contact"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="report-details">{t("reportDetails")}</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            type="submit"
            disabled={!reason || submitting}
            className="w-full"
          >
            {t("reportSubmit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
