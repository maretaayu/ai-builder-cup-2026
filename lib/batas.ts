/** Pembatas laju sederhana per IP (di memori) supaya kunci API berbayar tidak mudah disalahgunakan. */

const catatan = new Map<string, { n: number; reset: number }>();

export function boleh(req: Request, kunci: string, maks: number, jendelaMs = 60_000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
  const k = `${kunci}:${ip}`;
  const now = Date.now();
  const c = catatan.get(k);
  if (!c || now > c.reset) {
    catatan.set(k, { n: 1, reset: now + jendelaMs });
    if (catatan.size > 5000) catatan.clear();
    return true;
  }
  c.n += 1;
  return c.n <= maks;
}
