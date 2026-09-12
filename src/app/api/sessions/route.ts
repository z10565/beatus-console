import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { sessionSchema } from "@/lib/validation";

const SESSION_TYPE_LABEL: Record<string, string> = {
  individual: "Individual session",
  family: "Family session",
  child: "Child session",
  training: "Training session",
};

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId, specialistId, sessionType, scheduledAt, price, createInvoice } = parsed.data;

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const session = await db.session.create({
    data: {
      clientId,
      specialistId,
      sessionType,
      scheduledAt: scheduledDate,
      price,
      status: "booked",
    },
  });

  let invoice = null;
  if (createInvoice) {
    const dueDate = new Date(scheduledDate);
    dueDate.setDate(dueDate.getDate() + 14);

    invoice = await db.invoice.create({
      data: {
        clientId,
        sessionId: session.id,
        totalAmount: price,
        dueDate,
        status: "draft",
        lineItems: {
          create: [
            {
              type: "session",
              description: SESSION_TYPE_LABEL[sessionType] ?? "Session",
              amount: price,
            },
          ],
        },
      },
    });
  }

  return NextResponse.json({ session, invoice }, { status: 201 });
}
