"use client";

import { useMemo, useState } from "react";
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
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type ClientOption = { id: string; fullName: string };
type LineItem = { type: "session" | "equipment" | "training"; description: string; amount: string };

export function InvoiceForm({
  clients,
  defaultClientId = "",
}: {
  clients: ClientOption[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(defaultClientId);
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { type: "session", description: "", amount: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientOptions: SearchSelectOption[] = useMemo(
    () => clients.map((c) => ({ id: c.id, label: c.fullName })),
    [clients]
  );

  const total = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  function updateLineItem(index: number, patch: Partial<LineItem>) {
    setLineItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addLineItem() {
    setLineItems((items) => [...items, { type: "session", description: "", amount: "" }]);
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Please choose a client.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, dueDate, lineItems }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] || "Could not create invoice");
      }

      const data = await res.json();
      toast.success("Invoice created");
      router.push(`/invoices/${data.invoice.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Invoice details</CardTitle>
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
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Line items</Label>
            {lineItems.map((item, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                <div className="w-32 space-y-1">
                  <Label htmlFor={`type-${index}`} className="text-xs text-muted-foreground">
                    Type
                  </Label>
                  <Select
                    value={item.type}
                    onValueChange={(v) => updateLineItem(index, { type: v as LineItem["type"] })}
                  >
                    <SelectTrigger id={`type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label htmlFor={`description-${index}`} className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Input
                    id={`description-${index}`}
                    required
                    value={item.description}
                    onChange={(e) => updateLineItem(index, { description: e.target.value })}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label htmlFor={`amount-${index}`} className="text-xs text-muted-foreground">
                    Amount (EUR)
                  </Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.amount}
                    onChange={(e) => updateLineItem(index, { amount: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={lineItems.length === 1}
                  onClick={() => removeLineItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add line item
            </Button>
          </div>

          <div className="text-right text-sm font-medium">Total: {formatCurrency(total)}</div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create invoice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
