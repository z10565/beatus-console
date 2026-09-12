import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { contractSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partyType = req.nextUrl.searchParams.get("partyType");
  const where: Prisma.ContractWhereInput = {};
  if (partyType === "specialist" || partyType === "vendor" || partyType === "partner") {
    where.partyType = partyType;
  }

  const contracts = await db.contract.findMany({
    where,
    include: { specialist: true },
    orderBy: { expiryDate: "asc" },
  });

  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = contractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { partyType, partyName, specialistId, agreementType, startDate, expiryDate, fileUrl } =
    parsed.data;

  const contract = await db.contract.create({
    data: {
      partyType,
      partyName,
      specialistId: specialistId || null,
      agreementType,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      fileUrl: fileUrl || null,
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
