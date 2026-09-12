import { db } from "@/lib/db";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  const clients = await db.client.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New invoice</h1>
        <p className="text-sm text-muted-foreground">
          Build an invoice manually for a session, equipment, or training.
        </p>
      </div>
      <InvoiceForm clients={clients} defaultClientId={clientId ?? ""} />
    </div>
  );
}
