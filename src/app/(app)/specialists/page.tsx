import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpecialistFilterList } from "@/components/specialists/specialist-filter-list";
import { Plus } from "lucide-react";

export default async function SpecialistsPage() {
  const specialists = await db.specialist.findMany({
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      location: true,
      region: true,
      specialty: true,
      status: true,
    },
  });

  const lvCount = specialists.filter((s) => s.region === "LV" && s.status === "active").length;
  const uaCount = specialists.filter((s) => s.region === "UA" && s.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Specialists</h1>
          <p className="text-sm text-muted-foreground">
            {lvCount} active in Latvia · {uaCount} active in Ukraine
          </p>
        </div>
        <Button asChild>
          <Link href="/specialists/new">
            <Plus className="mr-2 h-4 w-4" />
            New specialist
          </Link>
        </Button>
      </div>

      {specialists.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No specialists yet.
          </CardContent>
        </Card>
      ) : (
        <SpecialistFilterList specialists={specialists} />
      )}
    </div>
  );
}
