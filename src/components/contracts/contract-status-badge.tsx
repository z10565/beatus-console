import { Badge } from "@/components/ui/badge";
import { contractDaysUntilExpiry, contractStatus, isContractUrgent } from "@/lib/derived";

const LABELS: Record<string, string> = {
  active: "Active",
  expiring_soon: "Expiring soon",
  expired: "Expired",
};

export function ContractStatusBadge({ expiryDate }: { expiryDate: Date | string }) {
  const expiry = new Date(expiryDate);
  const status = contractStatus(expiry);
  const urgent = isContractUrgent(expiry);
  const days = contractDaysUntilExpiry(expiry);

  const variant = status === "expired" ? "destructive" : urgent ? "destructive" : status === "expiring_soon" ? "secondary" : "outline";

  return (
    <Badge variant={variant}>
      {LABELS[status]}
      {status !== "expired" && ` · ${days}d`}
    </Badge>
  );
}
