import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CLIENT_NAMESPACES } from "./client-namespaces";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === "generated" || name === "node_modules" ? [] : sourceFiles(path);
    }
    return /\.(tsx|ts)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe("client translation sections", () => {
  it("ships every section that a client component uses", () => {
    const shipped = new Set<string>(CLIENT_NAMESPACES);
    const missing: string[] = [];

    for (const file of sourceFiles(join(process.cwd(), "src"))) {
      const text = readFileSync(file, "utf8");
      if (!/^\s*["']use client["']/.test(text)) continue;
      for (const m of text.matchAll(/useTranslations\(\s*["']([A-Za-z]+)/g)) {
        if (!shipped.has(m[1]!)) {
          missing.push(`${file.replace(process.cwd(), "").replace(/\\/g, "/")} uses "${m[1]}"`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("only lists sections that exist in both languages", async () => {
    const en = (await import("../../messages/en.json")).default as Record<string, unknown>;
    const ar = (await import("../../messages/ar.json")).default as Record<string, unknown>;
    for (const ns of CLIENT_NAMESPACES) {
      expect(en, `en.json is missing "${ns}"`).toHaveProperty(ns);
      expect(ar, `ar.json is missing "${ns}"`).toHaveProperty(ns);
    }
  });
});
