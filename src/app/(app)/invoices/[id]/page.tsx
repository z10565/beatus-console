import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceActions } from "@/components/invoices/invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      lineItems: true,
      session: { include: { specialist: true } },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Invoice</h1>
          <p className="text-sm text-muted-foreground">
            For{" "}
            <Link href={`/clients/${invoice.clientId}`} className="hover:underline">
              {invoice.client.fullName}
            </Link>
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.status} dueDate={invoice.dueDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issue date</span>
            <span>{formatDate(invoice.issueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due date</span>
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
          {invoice.sentAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sent at</span>
              <span>{formatDateTime(invoice.sentAt)}</span>
            </div>
          )}
          {invoice.paidAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid at</span>
              <span>{formatDateTime(invoice.paidAt)}</span>
            </div>
          )}
          {invoice.session && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Linked session</span>
              <span>
                {formatDateTime(invoice.session.scheduledAt)} with{" "}
                {invoice.session.specialist.fullName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoice.lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="capitalize text-muted-foreground">[{item.type}]</span>{" "}
                {item.description}
              </div>
              <span>{formatCurrency(item.amount.toString())}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatCurrency(invoice.totalAmount.toString())}</span>
          </div>
        </CardContent>
      </Card>

      <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
    </div>
  );
}
