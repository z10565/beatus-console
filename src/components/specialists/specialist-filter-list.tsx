"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
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

type SpecialistRow = {
  id: string;
  fullName: string;
  location: string;
  region: string;
  specialty: string;
  status: string;
};

export function SpecialistFilterList({ specialists }: { specialists: SpecialistRow[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return specialists.filter((s) => {
      const matchesQuery =
        !query.trim() ||
        s.fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.specialty.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = region === "all" || s.region === region;
      const matchesStatus = status === "all" || s.status === status;
      return matchesQuery && matchesRegion && matchesStatus;
    });
  }, [specialists, query, region, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            <SelectItem value="LV">Latvia</SelectItem>
            <SelectItem value="UA">Ukraine</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No specialists match these filters.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.id} href={`/specialists/${s.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.fullName}</span>
                    <Badge variant={s.status === "active" ? "default" : "outline"} className="capitalize">
                      {s.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.specialty}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.location} · {s.region === "LV" ? "Latvia" : "Ukraine"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
