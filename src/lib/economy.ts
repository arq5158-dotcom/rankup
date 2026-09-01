export type CreditEconomy = {
  creditsPerUsd: number;
  minUsd: number;
  maxUsd: number;
  packages: number[];
  customEnabled: boolean;
  purchaseEnabled: boolean;
  promoBonusPct: number;
};

export const DEFAULT_ECONOMY: CreditEconomy = {
  creditsPerUsd: 1000,
  minUsd: 1,
  maxUsd: 10_000,
  packages: [1, 5, 10, 25, 50, 100],
  customEnabled: true,
  purchaseEnabled: true,
  promoBonusPct: 0,
};

function num(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function parseEconomy(raw: string | null | undefined): CreditEconomy {
  if (!raw) return { ...DEFAULT_ECONOMY };
  try {
    const j = JSON.parse(raw) as Partial<CreditEconomy>;
    const packages = Array.isArray(j.packages)
      ? j.packages.map((n) => num(n)).filter((n) => n >= 1)
      : DEFAULT_ECONOMY.packages;
    return {
      creditsPerUsd: Math.max(1, Math.min(1_000_000, Math.round(num(j.creditsPerUsd, 1000)))),
      minUsd: Math.max(1, num(j.minUsd, 1)),
      maxUsd: Math.max(1, num(j.maxUsd, 10_000)),
      packages: packages.length ? packages : DEFAULT_ECONOMY.packages,
      customEnabled: j.customEnabled !== false,
      purchaseEnabled: j.purchaseEnabled !== false,
      promoBonusPct: Math.max(0, Math.min(100, num(j.promoBonusPct, 0))),
    };
  } catch {
    return { ...DEFAULT_ECONOMY };
  }
}

export function creditsFromUsd(usd: number, eco: CreditEconomy) {
  const base = Math.round(usd * eco.creditsPerUsd);
  const bonus = Math.round(base * (eco.promoBonusPct / 100));
  return Math.max(0, base + bonus);
}
