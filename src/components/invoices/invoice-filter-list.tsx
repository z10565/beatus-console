"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { effectiveInvoiceStatus, isInvoiceDueSoon } from "@/lib/derived";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

type InvoiceRow = {
  id: string;
  clientId: string;
  client: { fullName: string };
  totalAmount: string;
  dueDate: string;
  issueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
  lineItems: { description: string }[];
};

export function InvoiceFilterList({ invoices }: { invoices: InvoiceRow[] }) {
  const [tab, setTab] = useState("all");
  const router = useRouter();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const effective = effectiveInvoiceStatus(invoice.status, dueDate);

      if (effective === "overdue") {
        toast.error(`Overdue: ${invoice.client.fullName}`, {
          description: `${formatCurrency(invoice.totalAmount)} was due ${formatDate(dueDate)}.`,
          action: { label: "View", onClick: () => router.push(`/invoices/${invoice.id}`) },
        });
      } else if (isInvoiceDueSoon(invoice.status, dueDate)) {
        toast.warning(`Due soon: ${invoice.client.fullName}`, {
          description: `${formatCurrency(invoice.totalAmount)} needs to be paid by ${formatDate(dueDate)}.`,
          action: { label: "View", onClick: () => router.push(`/invoices/${invoice.id}`) },
        });
      }
    }
  }, [invoices, router]);

  const filtered = useMemo(() => {
    if (tab === "all") return invoices;
    return invoices.filter((inv) => effectiveInvoiceStatus(inv.status, new Date(inv.dueDate)) === tab);
  }, [invoices, tab]);

  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, sent: 0, paid: 0, overdue: 0 };
    for (const inv of invoices) {
      c[effectiveInvoiceStatus(inv.status, new Date(inv.dueDate))]++;
    }
    return c;
  }, [invoices]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({counts.sent})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({counts.overdue})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No invoices in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((invoice) => {
            const effective = effectiveInvoiceStatus(invoice.status, new Date(invoice.dueDate));
            return (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm hover:border-primary ${
                  effective === "overdue" ? "border-destructive/50 bg-destructive/5" : ""
                }`}
              >
                <div>
                  <div className="font-medium">{invoice.client.fullName}</div>
                  <div className="text-muted-foreground">
                    {invoice.lineItems.map((li) => li.description).join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Due {formatDate(invoice.dueDate)}</span>
                  <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                  <InvoiceStatusBadge status={invoice.status} dueDate={invoice.dueDate} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
