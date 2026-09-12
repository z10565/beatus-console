import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { equipmentSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = equipmentSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  const equipment = await db.equipment.update({
    where: { id },
    data: {
      ...(d.category !== undefined && { category: d.category }),
      ...(d.type !== undefined && { type: d.type }),
      ...(d.location !== undefined && { location: d.location }),
      ...(d.responsibleSpecialistId !== undefined && {
        responsibleSpecialistId: d.responsibleSpecialistId || null,
      }),
      ...(d.serialNumber !== undefined && { serialNumber: d.serialNumber || null }),
      ...(d.purchaseDate !== undefined && {
        purchaseDate: d.purchaseDate ? new Date(d.purchaseDate) : null,
      }),
      ...(d.lastGrainChange !== undefined && {
        lastGrainChange: d.lastGrainChange ? new Date(d.lastGrainChange) : null,
      }),
      ...(d.nextGrainChangeDue !== undefined && {
        nextGrainChangeDue: d.nextGrainChangeDue ? new Date(d.nextGrainChangeDue) : null,
      }),
      ...(d.notes !== undefined && { notes: d.notes || null }),
    },
  });

  return NextResponse.json({ equipment });
}
