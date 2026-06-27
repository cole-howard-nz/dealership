/**
 * Typed helpers for reading and writing system settings.
 *
 * Settings are stored as key-value pairs in the Setting table.
 * All values are serialised as strings.
 */

import { prisma } from "./prisma";

// ─── Key definitions ──────────────────────────────────────────────────────────

const DEFAULTS = {
  retentionPeriodMonths: "1",
  businessName: "Northbridge Motors",
  businessPhone: "",
  businessAddress: "",
} as const;

type SettingKey = keyof typeof DEFAULTS;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSetting<K extends SettingKey>(key: K): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key];
}

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.keys(DEFAULTS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<Record<SettingKey, string>>;
  return {
    retentionPeriodMonths: map.retentionPeriodMonths ?? DEFAULTS.retentionPeriodMonths,
    businessName: map.businessName ?? DEFAULTS.businessName,
    businessPhone: map.businessPhone ?? DEFAULTS.businessPhone,
    businessAddress: map.businessAddress ?? DEFAULTS.businessAddress,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
