import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [clients, specialists] = await Promise.all([
    db.client.findMany({
      where: { fullName: { contains: q, mode: "insensitive" } },
      take: 5,
      orderBy: { fullName: "asc" },
    }),
    db.specialist.findMany({
      where: { fullName: { contains: q, mode: "insensitive" } },
      take: 5,
      orderBy: { fullName: "asc" },
    }),
  ]);

  const results = [
    ...clients.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      type: "client" as const,
      subtitle: c.phone || c.email || "Client",
    })),
    ...specialists.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      type: "specialist" as const,
      subtitle: `${s.specialty} · ${s.location}`,
    })),
  ];

  return NextResponse.json({ results });
}
