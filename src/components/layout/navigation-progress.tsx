"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_EVENT = "bumayed:navstart";

/**
 * Call before router.push / router.replace so the bar shows right away.
 * Link clicks are detected automatically.
 */
export function startNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START_EVENT));
  }
}

function isInternalNavigation(e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const anchor = (e.target as Element | null)?.closest?.("a");
  if (!anchor || !anchor.href) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Same page (or only a #hash change): nothing will load.
  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search
  );
}

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  // Start on link clicks and on explicit startNavigationProgress() calls.
  useEffect(() => {
    function start() {
      clearTimers();
      setVisible(true);
      setProgress(12);
      // Ease toward 90% while waiting; never reaches 100 until the route commits.
      [150, 400, 900, 1800, 3500].forEach((delay, i) => {
        timers.current.push(
          window.setTimeout(() => setProgress([30, 50, 68, 80, 90][i]), delay),
        );
      });
      // Safety net: never leave the bar stuck if a navigation is cancelled.
      timers.current.push(
        window.setTimeout(() => {
          setProgress(100);
          window.setTimeout(() => setVisible(false), 200);
        }, 15000),
      );
    }
    function onClick(e: MouseEvent) {
      if (isInternalNavigation(e)) start();
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(START_EVENT, start);
      clearTimers();
    };
  }, []);

  // Finish when the new route (path or query) has rendered.
  useEffect(() => {
    clearTimers();
    // Updates run in timer callbacks, not synchronously in the effect.
    const fill = window.setTimeout(
      () => setProgress((p) => (p > 0 ? 100 : 0)),
      0,
    );
    const hide = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    return () => {
      window.clearTimeout(fill);
      window.clearTimeout(hide);
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
    >
      <div
        className="h-full bg-accent shadow-[0_0_8px_var(--color-accent)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/** Thin gold bar at the top of the page while a navigation is in flight. */
export function NavigationProgress() {
  // useSearchParams needs a Suspense boundary so static pages can prerender.
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
