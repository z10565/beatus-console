import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/equipment-form";

export default async function NewEquipmentPage() {
  const specialists = await db.specialist.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New equipment</h1>
        <p className="text-sm text-muted-foreground">Add a finished good or raw material to the register.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm specialists={specialists} />
        </CardContent>
      </Card>
    </div>
  );
}
