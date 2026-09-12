import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { clientSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const clients = await db.client.findMany({
    where: q ? { fullName: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { fullName: "asc" },
    take: 100,
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await db.client.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      referredBy: parsed.data.referredBy,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json({ client }, { status: 201 });
}
