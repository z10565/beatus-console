"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect, type SearchSelectOption } from "@/components/search-select";
import { formatDateTime } from "@/lib/format";

type ClientOption = { id: string; fullName: string };
type SpecialistOption = {
  id: string;
  fullName: string;
  region: string;
  specialty: string;
  location: string;
};
type UpcomingSession = { id: string; scheduledAt: string; client: { fullName: string } };

export function BookingForm({
  clients,
  specialists,
  defaultClientId = "",
  defaultSpecialistId = "",
}: {
  clients: ClientOption[];
  specialists: SpecialistOption[];
  defaultClientId?: string;
  defaultSpecialistId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(defaultClientId);
  const [specialistId, setSpecialistId] = useState(defaultSpecialistId);
  const [sessionType, setSessionType] = useState("individual");
  const [scheduledAt, setScheduledAt] = useState("");
  const [price, setPrice] = useState("");
  const [createInvoice, setCreateInvoice] = useState(true);
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientOptions: SearchSelectOption[] = useMemo(
    () => clients.map((c) => ({ id: c.id, label: c.fullName })),
    [clients]
  );
  const specialistOptions: SearchSelectOption[] = useMemo(
    () =>
      specialists.map((s) => ({
        id: s.id,
        label: s.fullName,
        sublabel: `${s.specialty} · ${s.location} · ${s.region === "LV" ? "Latvia" : "Ukraine"}`,
      })),
    [specialists]
  );

  useEffect(() => {
    if (!specialistId) {
      setUpcoming([]);
      return;
    }
    fetch(`/api/specialists/${specialistId}/sessions`)
      .then((res) => res.json())
      .then((data) => setUpcoming(data.sessions ?? []))
      .catch(() => setUpcoming([]));
  }, [specialistId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId || !specialistId) {
      setError("Please choose both a client and a specialist.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          specialistId,
          sessionType,
          scheduledAt,
          price,
          createInvoice,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] || "Could not create booking");
      }

      const data = await res.json();
      toast.success(createInvoice ? "Session booked and invoice created" : "Session booked");
      if (data.invoice) {
        router.push(`/invoices/${data.invoice.id}`);
      } else {
        router.push(`/clients/${clientId}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Booking details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <SearchSelect
                options={clientOptions}
                value={clientId}
                onChange={setClientId}
                placeholder="Search clients..."
              />
            </div>
            <div className="space-y-2">
              <Label>Specialist</Label>
              <SearchSelect
                options={specialistOptions}
                value={specialistId}
                onChange={setSpecialistId}
                placeholder="Search specialists..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger id="sessionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createInvoice}
                onChange={(e) => setCreateInvoice(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Generate a draft invoice for this session immediately
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking..." : "Book session"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specialist&apos;s upcoming schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {!specialistId ? (
            <p className="text-sm text-muted-foreground">Select a specialist to see their schedule.</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions booked.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => (
                <div key={s.id} className="rounded-md border px-3 py-2 text-sm">
                  <div className="font-medium">{formatDateTime(s.scheduledAt)}</div>
                  <div className="text-muted-foreground">{s.client.fullName}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
