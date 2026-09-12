import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ClientSearchList } from "@/components/clients/client-search-list";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, phone: true, email: true, referredBy: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Find a client&apos;s contact details and full history in one place.
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New client
          </Link>
        </Button>
      </div>

      <ClientSearchList clients={clients} />
    </div>
  );
}
