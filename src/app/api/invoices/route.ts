import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { invoiceSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");

  const where: Prisma.InvoiceWhereInput = {};
  if (status === "draft" || status === "sent" || status === "paid") {
    where.status = status;
  } else if (status === "overdue") {
    where.status = "sent";
    where.dueDate = { lt: new Date() };
  }

  const invoices = await db.invoice.findMany({
    where,
    include: { client: true, lineItems: true },
    orderBy: { issueDate: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId, sessionId, dueDate, issueDate, lineItems } = parsed.data;
  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const invoice = await db.invoice.create({
    data: {
      clientId,
      sessionId: sessionId || null,
      totalAmount,
      dueDate: new Date(dueDate),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      status: "draft",
      lineItems: {
        create: lineItems.map((item) => ({
          type: item.type,
          description: item.description,
          amount: item.amount,
        })),
      },
    },
    include: { lineItems: true },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
