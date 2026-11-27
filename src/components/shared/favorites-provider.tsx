"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

type FavoritesContext = {
  signedIn: boolean;
  isSaved: (listingId: string) => boolean;
  /** Saves or unsaves an ad. Guests are sent to sign in and brought back. */
  toggle: (listingId: string) => Promise<void>;
  pending: (listingId: string) => boolean;
  /** Tell the store what the server already knows (e.g. on the ad page). */
  seed: (listingId: string, saved: boolean) => void;
};

const Ctx = createContext<FavoritesContext | null>(null);

/**
 * One shared list of the visitor's saved ads, loaded once per visit, so
 * every heart on the page (cards and the ad page) shows the same state and
 * updates together.
 */
export function FavoritesProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("favorites");
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch("/api/favorites?ids=1")
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d: { ids?: string[] }) => {
        if (!cancelled) setIds(new Set(d.ids ?? []));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const goToLogin = useCallback(() => {
    const back = window.location.pathname + window.location.search;
    toast(t("signInToSave"));
    router.push(`/auth/login?callbackUrl=${encodeURIComponent(back)}`);
  }, [router, t]);

  const toggle = useCallback(
    async (listingId: string) => {
      if (!signedIn) {
        goToLogin();
        return;
      }
      const wasSaved = ids.has(listingId);
      // Optimistic: flip the heart right away, roll back if the server says no.
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      setBusy((prev) => new Set(prev).add(listingId));
      try {
        const res = wasSaved
          ? await fetch(
              `/api/favorites?listingId=${encodeURIComponent(listingId)}`,
              { method: "DELETE" },
            )
          : await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ listingId }),
            });
        if (res.status === 401) {
          goToLogin();
          throw new Error("UNAUTHORIZED");
        }
        if (!res.ok) throw new Error("FAILED");
        if (wasSaved) {
          toast(t("removedToast"));
        } else {
          toast.success(t("savedToast"), {
            action: {
              label: t("view"),
              onClick: () => router.push("/dashboard/favorites"),
            },
          });
        }
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
      } finally {
        setBusy((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      }
    },
    [goToLogin, ids, router, signedIn, t],
  );

  const seed = useCallback((listingId: string, saved: boolean) => {
    setIds((prev) => {
      if (prev.has(listingId) === saved) return prev;
      const next = new Set(prev);
      if (saved) next.add(listingId);
      else next.delete(listingId);
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContext>(
    () => ({
      signedIn,
      isSaved: (id) => ids.has(id),
      toggle,
      pending: (id) => busy.has(id),
      seed,
    }),
    [busy, ids, seed, signedIn, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  return useContext(Ctx);
}
