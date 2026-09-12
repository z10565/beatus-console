"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: "draft" | "sent" | "paid" | "overdue";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function performAction(action: "mark_sent" | "mark_paid") {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Could not update invoice");
      toast.success(action === "mark_sent" ? "Invoice marked as sent" : "Invoice marked as paid");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status === "draft" && (
        <Button onClick={() => performAction("mark_sent")} disabled={loading}>
          Mark as sent
        </Button>
      )}
      {(status === "sent" || status === "overdue") && (
        <Button onClick={() => performAction("mark_paid")} disabled={loading}>
          Mark as paid
        </Button>
      )}
    </div>
  );
}
