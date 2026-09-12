import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EquipmentFilterList } from "@/components/equipment/equipment-filter-list";
import { Plus } from "lucide-react";

export default async function EquipmentPage() {
  const equipment = await db.equipment.findMany({
    include: { responsibleSpecialist: true },
    orderBy: { location: "asc" },
  });

  const serialized = equipment.map((eq) => ({
    id: eq.id,
    category: eq.category,
    type: eq.type,
    location: eq.location,
    serialNumber: eq.serialNumber,
    nextGrainChangeDue: eq.nextGrainChangeDue ? eq.nextGrainChangeDue.toISOString() : null,
    responsibleSpecialist: eq.responsibleSpecialist
      ? { fullName: eq.responsibleSpecialist.fullName }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Equipment register</h1>
          <p className="text-sm text-muted-foreground">
            Track finished goods and raw materials by location, type, and grain-replacement schedule.
          </p>
        </div>
        <Button asChild>
          <Link href="/equipment/new">
            <Plus className="mr-2 h-4 w-4" />
            New equipment
          </Link>
        </Button>
      </div>

      <EquipmentFilterList equipment={serialized} />
    </div>
  );
}
