import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractForm } from "@/components/contracts/contract-form";

export default async function NewContractPage() {
  const specialists = await db.specialist.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New contract</h1>
        <p className="text-sm text-muted-foreground">Record a specialist, vendor, or partner agreement.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract details</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractForm specialists={specialists} />
        </CardContent>
      </Card>
    </div>
  );
}
