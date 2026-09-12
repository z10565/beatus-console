"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { contractDaysUntilExpiry, contractStatus } from "@/lib/derived";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { RenewContractDialog } from "@/components/contracts/renew-contract-dialog";

type ContractRow = {
  id: string;
  partyType: "specialist" | "vendor" | "partner";
  partyName: string;
  agreementType: string;
  startDate: string;
  expiryDate: string;
};

export function ContractList({ contracts }: { contracts: ContractRow[] }) {
  const [tab, setTab] = useState("all");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;

    for (const contract of contracts) {
      const expiryDate = new Date(contract.expiryDate);
      if (contractStatus(expiryDate) !== "expiring_soon") continue;

      const days = contractDaysUntilExpiry(expiryDate);
      toast.warning(`Contract expiring soon: ${contract.partyName}`, {
        description: `${contract.agreementType} expires ${formatDate(expiryDate)} (${days}d) and needs to be renewed.`,
      });
    }
  }, [contracts]);

  const filtered = useMemo(() => {
    if (tab === "all") return contracts;
    return contracts.filter((c) => c.partyType === tab);
  }, [contracts, tab]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({contracts.length})</TabsTrigger>
          <TabsTrigger value="specialist">
            Specialists ({contracts.filter((c) => c.partyType === "specialist").length})
          </TabsTrigger>
          <TabsTrigger value="vendor">
            Vendors ({contracts.filter((c) => c.partyType === "vendor").length})
          </TabsTrigger>
          <TabsTrigger value="partner">
            Partners ({contracts.filter((c) => c.partyType === "partner").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No contracts in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((contract) => (
            <div
              key={contract.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium">{contract.partyName}</div>
                <div className="text-muted-foreground">
                  {contract.agreementType} · Started {formatDate(contract.startDate)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Expires {formatDate(contract.expiryDate)}</span>
                <ContractStatusBadge expiryDate={contract.expiryDate} />
                <RenewContractDialog contractId={contract.id} partyName={contract.partyName} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
