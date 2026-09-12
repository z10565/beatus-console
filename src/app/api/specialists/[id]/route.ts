import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { specialistSchema } from "@/lib/validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const specialist = await db.specialist.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { client: true },
        orderBy: { scheduledAt: "desc" },
      },
      contracts: true,
      equipment: true,
    },
  });

  if (!specialist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ specialist });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = specialistSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const specialist = await db.specialist.update({
    where: { id },
    data: {
      ...(parsed.data.fullName !== undefined && { fullName: parsed.data.fullName }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone || null }),
      ...(parsed.data.email !== undefined && { email: parsed.data.email || null }),
      ...(parsed.data.location !== undefined && { location: parsed.data.location }),
      ...(parsed.data.region !== undefined && { region: parsed.data.region }),
      ...(parsed.data.specialty !== undefined && { specialty: parsed.data.specialty }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.bio !== undefined && { bio: parsed.data.bio || null }),
    },
  });

  return NextResponse.json({ specialist });
}
