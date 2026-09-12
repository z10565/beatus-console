"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect, type SearchSelectOption } from "@/components/search-select";

type SpecialistOption = { id: string; fullName: string };

export function ContractForm({ specialists }: { specialists: SpecialistOption[] }) {
  const router = useRouter();
  const [partyType, setPartyType] = useState<"specialist" | "vendor" | "partner">("specialist");
  const [partyName, setPartyName] = useState("");
  const [specialistId, setSpecialistId] = useState("");
  const [agreementType, setAgreementType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const specialistOptions: SearchSelectOption[] = useMemo(
    () => specialists.map((s) => ({ id: s.id, label: s.fullName })),
    [specialists]
  );

  function handleSpecialistChange(id: string) {
    setSpecialistId(id);
    const specialist = specialists.find((s) => s.id === id);
    if (specialist && !partyName) setPartyName(specialist.fullName);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyType,
          partyName,
          specialistId: partyType === "specialist" ? specialistId : "",
          agreementType,
          startDate,
          expiryDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] || "Could not create contract");
      }

      toast.success("Contract created");
      router.push("/contracts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="partyType">Party type</Label>
        <Select value={partyType} onValueChange={(v) => setPartyType(v as typeof partyType)}>
          <SelectTrigger id="partyType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="specialist">Specialist</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {partyType === "specialist" && (
        <div className="space-y-2">
          <Label>Specialist</Label>
          <SearchSelect
            options={specialistOptions}
            value={specialistId}
            onChange={handleSpecialistChange}
            placeholder="Search specialists..."
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="partyName">Party name</Label>
        <Input id="partyName" required value={partyName} onChange={(e) => setPartyName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agreementType">Agreement type</Label>
        <Input
          id="agreementType"
          required
          placeholder="e.g. Equipment partnership"
          value={agreementType}
          onChange={(e) => setAgreementType(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry date</Label>
          <Input
            id="expiryDate"
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Create contract"}
      </Button>
    </form>
  );
}
