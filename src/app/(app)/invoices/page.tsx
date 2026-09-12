import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { InvoiceFilterList } from "@/components/invoices/invoice-filter-list";
import { Plus } from "lucide-react";

export default async function InvoicesPage() {
  const invoices = await db.invoice.findMany({
    include: { client: true, lineItems: true },
    orderBy: { issueDate: "desc" },
  });

  const serialized = invoices.map((inv) => ({
    ...inv,
    totalAmount: inv.totalAmount.toString(),
    dueDate: inv.dueDate.toISOString(),
    issueDate: inv.issueDate.toISOString(),
    lineItems: inv.lineItems.map((li) => ({ ...li, amount: li.amount.toString() })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Track what&apos;s unpaid, sent, and overdue at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New invoice
          </Link>
        </Button>
      </div>

      <InvoiceFilterList invoices={serialized} />
    </div>
  );
}
