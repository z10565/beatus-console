import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { specialistSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const region = req.nextUrl.searchParams.get("region");
  const status = req.nextUrl.searchParams.get("status");
  const specialty = req.nextUrl.searchParams.get("specialty")?.trim();

  const where: Prisma.SpecialistWhereInput = {};
  if (q) where.fullName = { contains: q, mode: "insensitive" };
  if (region === "LV" || region === "UA") where.region = region;
  if (status === "active" || status === "inactive") where.status = status;
  if (specialty) where.specialty = { contains: specialty, mode: "insensitive" };

  const specialists = await db.specialist.findMany({
    where,
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ specialists });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = specialistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const specialist = await db.specialist.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      location: parsed.data.location,
      region: parsed.data.region,
      specialty: parsed.data.specialty,
      status: parsed.data.status,
      bio: parsed.data.bio || null,
    },
  });

  return NextResponse.json({ specialist }, { status: 201 });
}
