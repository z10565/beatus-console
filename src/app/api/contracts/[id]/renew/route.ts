import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { contractRenewSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = contractRenewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.contract.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newExpiry = new Date(existing.expiryDate);
  newExpiry.setMonth(newExpiry.getMonth() + parsed.data.months);

  const contract = await db.contract.update({
    where: { id },
    data: {
      expiryDate: newExpiry,
      renewalHistory: { push: existing.expiryDate },
    },
  });

  return NextResponse.json({ contract });
}
