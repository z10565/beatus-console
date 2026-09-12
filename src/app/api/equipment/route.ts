import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { equipmentSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = req.nextUrl.searchParams.get("category");
  const location = req.nextUrl.searchParams.get("location")?.trim();

  const where: Prisma.EquipmentWhereInput = {};
  if (category === "finished_good" || category === "raw_material") where.category = category;
  if (location) where.location = { contains: location, mode: "insensitive" };

  const equipment = await db.equipment.findMany({
    where,
    include: { responsibleSpecialist: true },
    orderBy: { location: "asc" },
  });

  return NextResponse.json({ equipment });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = equipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const equipment = await db.equipment.create({
    data: {
      category: data.category,
      type: data.type,
      location: data.location,
      responsibleSpecialistId: data.responsibleSpecialistId || null,
      serialNumber: data.serialNumber || null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      lastGrainChange: data.lastGrainChange ? new Date(data.lastGrainChange) : null,
      nextGrainChangeDue: data.nextGrainChangeDue ? new Date(data.nextGrainChangeDue) : null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json({ equipment }, { status: 201 });
}
