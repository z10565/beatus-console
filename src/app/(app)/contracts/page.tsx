import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ContractList } from "@/components/contracts/contract-list";
import { contractStatus } from "@/lib/derived";
import { Plus } from "lucide-react";

const STATUS_ORDER: Record<string, number> = { expired: 0, expiring_soon: 1, active: 2 };

export default async function ContractsPage() {
  const contracts = await db.contract.findMany({
    include: { specialist: true },
  });

  const sorted = [...contracts].sort((a, b) => {
    const statusDiff = STATUS_ORDER[contractStatus(a.expiryDate)] - STATUS_ORDER[contractStatus(b.expiryDate)];
    if (statusDiff !== 0) return statusDiff;
    return a.expiryDate.getTime() - b.expiryDate.getTime();
  });

  const serialized = sorted.map((c) => ({
    id: c.id,
    partyType: c.partyType,
    partyName: c.partyName,
    agreementType: c.agreementType,
    startDate: c.startDate.toISOString(),
    expiryDate: c.expiryDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Specialist and vendor agreements, with expiring ones surfaced first.
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            New contract
          </Link>
        </Button>
      </div>

      <ContractList contracts={serialized} />
    </div>
  );
}
