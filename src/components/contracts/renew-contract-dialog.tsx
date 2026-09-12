"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";

export function RenewContractDialog({ contractId, partyName }: { contractId: string; partyName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState("12");
  const [submitting, setSubmitting] = useState(false);

  async function handleRenew() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: Number(months) }),
      });
      if (!res.ok) throw new Error("Could not renew contract");
      toast.success("Contract renewed");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Renew
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew contract</DialogTitle>
          <DialogDescription>
            Extend {partyName}&apos;s agreement by a chosen term. The current expiry date will be logged
            to renewal history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="months">Extend by (months)</Label>
          <Input
            id="months"
            type="number"
            min="1"
            max="60"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleRenew} disabled={submitting}>
            {submitting ? "Renewing..." : "Confirm renewal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
