import { Badge } from "@/components/ui/badge";
import { effectiveInvoiceStatus } from "@/lib/derived";

const LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

export function InvoiceStatusBadge({
  status,
  dueDate,
}: {
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: Date | string;
}) {
  const effective = effectiveInvoiceStatus(status, new Date(dueDate));

  const variant =
    effective === "paid"
      ? "default"
      : effective === "overdue"
        ? "destructive"
        : effective === "sent"
          ? "secondary"
          : "outline";

  return <Badge variant={variant}>{LABELS[effective]}</Badge>;
}
