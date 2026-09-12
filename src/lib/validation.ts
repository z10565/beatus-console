import { z } from "zod";

export const referredByValues = [
  "website",
  "social",
  "linktree",
  "friend_referral",
  "local_specialist",
  "other",
] as const;

export const clientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  referredBy: z.enum(referredByValues).default("other"),
  notes: z.string().optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const specialistRegionValues = ["LV", "UA"] as const;
export const specialistStatusValues = ["active", "inactive"] as const;

export const specialistSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  region: z.enum(specialistRegionValues),
  specialty: z.string().min(1, "Specialty is required"),
  status: z.enum(specialistStatusValues).default("active"),
  bio: z.string().optional().or(z.literal("")),
});

export type SpecialistInput = z.infer<typeof specialistSchema>;

export const sessionTypeValues = ["individual", "family", "child", "training"] as const;
export const sessionStatusValues = ["booked", "completed", "cancelled"] as const;

export const sessionSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  specialistId: z.string().min(1, "Specialist is required"),
  sessionType: z.enum(sessionTypeValues),
  scheduledAt: z.string().min(1, "Date & time is required"),
  price: z.coerce.number().min(0, "Price must be zero or more"),
  createInvoice: z.boolean().optional(),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const invoiceLineItemTypeValues = ["session", "equipment", "training"] as const;

export const invoiceLineItemSchema = z.object({
  type: z.enum(invoiceLineItemTypeValues),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0, "Amount must be zero or more"),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  sessionId: z.string().optional().or(z.literal("")),
  dueDate: z.string().min(1, "Due date is required"),
  issueDate: z.string().optional().or(z.literal("")),
  lineItems: z.array(invoiceLineItemSchema).min(1, "At least one line item is required"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const contractPartyTypeValues = ["specialist", "vendor", "partner"] as const;

export const contractSchema = z.object({
  partyType: z.enum(contractPartyTypeValues),
  partyName: z.string().min(1, "Party name is required"),
  specialistId: z.string().optional().or(z.literal("")),
  agreementType: z.string().min(1, "Agreement type is required"),
  startDate: z.string().min(1, "Start date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  fileUrl: z.string().optional().or(z.literal("")),
});

export type ContractInput = z.infer<typeof contractSchema>;

export const contractRenewSchema = z.object({
  months: z.coerce.number().int().min(1).max(60),
});

export const equipmentCategoryValues = ["finished_good", "raw_material"] as const;

export const equipmentSchema = z.object({
  category: z.enum(equipmentCategoryValues),
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  responsibleSpecialistId: z.string().optional().or(z.literal("")),
  serialNumber: z.string().optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  lastGrainChange: z.string().optional().or(z.literal("")),
  nextGrainChangeDue: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;
