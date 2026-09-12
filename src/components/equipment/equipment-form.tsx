"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect, type SearchSelectOption } from "@/components/search-select";

type SpecialistOption = { id: string; fullName: string };

export function EquipmentForm({ specialists }: { specialists: SpecialistOption[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<"finished_good" | "raw_material">("finished_good");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [responsibleSpecialistId, setResponsibleSpecialistId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [lastGrainChange, setLastGrainChange] = useState("");
  const [nextGrainChangeDue, setNextGrainChangeDue] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const specialistOptions: SearchSelectOption[] = useMemo(
    () => specialists.map((s) => ({ id: s.id, label: s.fullName })),
    [specialists]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          type,
          location,
          responsibleSpecialistId,
          serialNumber,
          purchaseDate,
          lastGrainChange,
          nextGrainChangeDue,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] || "Could not create equipment record");
      }

      toast.success("Equipment added");
      router.push("/equipment");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finished_good">Finished good</SelectItem>
              <SelectItem value="raw_material">Raw material</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            required
            placeholder={category === "finished_good" ? "e.g. Mini Unit, Grains, Cards" : "e.g. Electrical component, Steel"}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serial number</Label>
        <Input id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Responsible specialist</Label>
        <SearchSelect
          options={specialistOptions}
          value={responsibleSpecialistId}
          onChange={setResponsibleSpecialistId}
          placeholder="Search specialists..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastGrainChange">Last grain change</Label>
          <Input
            id="lastGrainChange"
            type="date"
            value={lastGrainChange}
            onChange={(e) => setLastGrainChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextGrainChangeDue">Next grain change due</Label>
          <Input
            id="nextGrainChangeDue"
            type="date"
            value={nextGrainChangeDue}
            onChange={(e) => setNextGrainChangeDue(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add equipment"}
      </Button>
    </form>
  );
}
