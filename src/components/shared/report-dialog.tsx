"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function ReportDialog() {
  const t = useTranslations("detail");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Honest placeholder: the report backend ships in Phase 8 (moderation).
    // No fake success state — the user is told exactly what happened.
    toast.info(t("reportDemo"));
    setOpen(false);
    setReason("");
    setDetails("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}
      >
        <Flag className="size-4" aria-hidden />
        {t("report")}
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
          <div className="space-y-1.5">
            <Label htmlFor="report-details">{t("reportDetails")}</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={!reason} className="w-full">
            {t("reportSubmit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
