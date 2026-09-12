import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { effectiveInvoiceStatus } from "@/lib/derived";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Plus, Mail, Phone } from "lucide-react";

const REFERRED_BY_LABELS: Record<string, string> = {
  website: "Website",
  social: "Social media",
  linktree: "Linktree",
  friend_referral: "Friend referral",
  local_specialist: "Local specialist",
  other: "Other",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { specialist: true },
        orderBy: { scheduledAt: "desc" },
      },
      invoices: {
        include: { lineItems: true },
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!client) notFound();

  const lastSpecialistSession = client.sessions.find((s) => s.status !== "cancelled");
  const equipmentLineItems = client.invoices.flatMap((inv) =>
    inv.lineItems.filter((li) => li.type === "equipment").map((li) => ({ ...li, invoice: inv }))
  );
  const outstandingInvoices = client.invoices.filter((inv) => {
    const eff = effectiveInvoiceStatus(inv.status, inv.dueDate);
    return eff === "sent" || eff === "overdue";
  });
  const outstandingTotal = outstandingInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.totalAmount.toString()),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{client.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            Client since {formatDate(client.createdAt)} · Referred via{" "}
            {REFERRED_BY_LABELS[client.referredBy]}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/bookings/new?clientId=${client.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New booking
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/invoices/new?clientId=${client.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {client.phone || "—"}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {client.email || "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last specialist seen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {lastSpecialistSession ? (
              <Link
                href={`/specialists/${lastSpecialistSession.specialistId}`}
                className="font-medium hover:underline"
              >
                {lastSpecialistSession.specialist.fullName}
              </Link>
            ) : (
              "No sessions yet"
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding balance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className={outstandingTotal > 0 ? "font-semibold text-destructive" : "font-medium"}>
              {formatCurrency(outstandingTotal)}
            </span>{" "}
            <span className="text-muted-foreground">
              ({outstandingInvoices.length} invoice{outstandingInvoices.length === 1 ? "" : "s"})
            </span>
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{client.notes}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session history</CardTitle>
        </CardHeader>
        <CardContent>
          {client.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions booked yet.</p>
          ) : (
            <div className="space-y-2">
              {client.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium capitalize">{session.sessionType} session</div>
                    <div className="text-muted-foreground">
                      {formatDateTime(session.scheduledAt)} with{" "}
                      <Link href={`/specialists/${session.specialistId}`} className="hover:underline">
                        {session.specialist.fullName}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{formatCurrency(session.price.toString())}</span>
                    <Badge variant={session.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {client.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {client.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm hover:border-primary"
                >
                  <div>
                    <div className="font-medium">
                      {invoice.lineItems.map((li) => li.description).join(", ")}
                    </div>
                    <div className="text-muted-foreground">Due {formatDate(invoice.dueDate)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{formatCurrency(invoice.totalAmount.toString())}</span>
                    <InvoiceStatusBadge status={invoice.status} dueDate={invoice.dueDate} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {equipmentLineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment purchased</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {equipmentLineItems.map((li) => (
              <div key={li.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{li.description}</span>
                <span>{formatCurrency(li.amount.toString())}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
