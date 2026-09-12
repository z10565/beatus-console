export type ContractStatus = "active" | "expiring_soon" | "expired";

const DAY_MS = 24 * 60 * 60 * 1000;

export function contractStatus(expiryDate: Date, now: Date = new Date()): ContractStatus {
  const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS);
  if (daysUntil < 0) return "expired";
  if (daysUntil <= 60) return "expiring_soon";
  return "active";
}

export function contractDaysUntilExpiry(expiryDate: Date, now: Date = new Date()): number {
  return Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS);
}

export function isContractUrgent(expiryDate: Date, now: Date = new Date()): boolean {
  const daysUntil = contractDaysUntilExpiry(expiryDate, now);
  return daysUntil >= 0 && daysUntil <= 21;
}

export type EffectiveInvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export function effectiveInvoiceStatus(
  status: "draft" | "sent" | "paid" | "overdue",
  dueDate: Date,
  now: Date = new Date()
): EffectiveInvoiceStatus {
  if (status === "paid" || status === "draft") return status;
  if (dueDate.getTime() < now.getTime()) return "overdue";
  return "sent";
}

export function isInvoiceDueSoon(
  status: "draft" | "sent" | "paid" | "overdue",
  dueDate: Date,
  now: Date = new Date()
): boolean {
  if (effectiveInvoiceStatus(status, dueDate, now) !== "sent") return false;
  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);
  return daysUntil <= 3;
}

export function isGrainChangeDueSoon(dueDate: Date | null, now: Date = new Date()): boolean {
  if (!dueDate) return false;
  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);
  return daysUntil <= 14;
}
