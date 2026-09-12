import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const sessions = await db.session.findMany({
    where: {
      specialistId: id,
      status: "booked",
      scheduledAt: { gte: new Date() },
    },
    include: { client: true },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ sessions });
}
