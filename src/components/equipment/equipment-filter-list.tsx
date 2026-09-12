"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { isGrainChangeDueSoon } from "@/lib/derived";
import { Search } from "lucide-react";

type EquipmentRow = {
  id: string;
  category: "finished_good" | "raw_material";
  type: string;
  location: string;
  serialNumber: string | null;
  nextGrainChangeDue: string | null;
  responsibleSpecialist: { fullName: string } | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  finished_good: "Finished good",
  raw_material: "Raw material",
};

export function EquipmentFilterList({ equipment }: { equipment: EquipmentRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return equipment.filter((e) => {
      const matchesQuery =
        !query.trim() ||
        e.location.toLowerCase().includes(query.toLowerCase()) ||
        e.type.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || e.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [equipment, query, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by location or type..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="finished_good">Finished good</SelectItem>
            <SelectItem value="raw_material">Raw material</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No equipment matches these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((eq) => {
            const dueSoon = isGrainChangeDueSoon(
              eq.nextGrainChangeDue ? new Date(eq.nextGrainChangeDue) : null
            );
            return (
              <Card key={eq.id} className={dueSoon ? "border-destructive/50 bg-destructive/5" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{eq.type}</span>
                    {dueSoon && <Badge variant="destructive">Grain change due</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{CATEGORY_LABELS[eq.category]}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{eq.location}</div>
                  {eq.serialNumber && (
                    <div className="text-xs text-muted-foreground">S/N {eq.serialNumber}</div>
                  )}
                  {eq.responsibleSpecialist && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Responsible: {eq.responsibleSpecialist.fullName}
                    </div>
                  )}
                  {eq.nextGrainChangeDue && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Grain change due {formatDate(eq.nextGrainChangeDue)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
