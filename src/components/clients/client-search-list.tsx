"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ClientRow = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  referredBy: string;
};

export function ClientSearchList({ clients }: { clients: ClientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.fullName.toLowerCase().includes(q));
  }, [clients, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {query ? `No client found matching "${query}".` : "No clients yet."}
            </p>
            <Button asChild>
              <Link href={`/clients/new?name=${encodeURIComponent(query)}`}>
                <UserPlus className="mr-2 h-4 w-4" />
                New client{query ? ` "${query}"` : ""}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardContent className="py-4">
                <div className="font-medium">{client.fullName}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {client.phone || client.email || "No contact info"}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
