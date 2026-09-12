import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/format";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { Plus, Mail, Phone, MapPin } from "lucide-react";

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const specialist = await db.specialist.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { client: true },
        orderBy: { scheduledAt: "desc" },
        take: 20,
      },
      contracts: { orderBy: { expiryDate: "asc" } },
      equipment: true,
    },
  });

  if (!specialist) notFound();

  const upcomingSessions = specialist.sessions.filter(
    (s) => s.status === "booked" && s.scheduledAt.getTime() >= Date.now()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{specialist.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {specialist.specialty} · Onboarded {formatDate(specialist.onboardingDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={specialist.status === "active" ? "default" : "outline"} className="capitalize">
            {specialist.status}
          </Badge>
          <Button asChild variant="outline">
            <Link href={`/bookings/new?specialistId=${specialist.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contact info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {specialist.phone || "—"}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {specialist.email || "—"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {specialist.location} ({specialist.region === "LV" ? "Latvia" : "Ukraine"})
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{upcomingSessions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipment responsible for
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{specialist.equipment.length}</CardContent>
        </Card>
      </div>

      {specialist.bio && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bio</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{specialist.bio}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions booked.</p>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium capitalize">{session.sessionType} session</div>
                    <div className="text-muted-foreground">{formatDateTime(session.scheduledAt)}</div>
                  </div>
                  <Link href={`/clients/${session.clientId}`} className="hover:underline">
                    {session.client.fullName}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {specialist.contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contracts on file.</p>
          ) : (
            <div className="space-y-2">
              {specialist.contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">{contract.agreementType}</div>
                    <div className="text-muted-foreground">Expires {formatDate(contract.expiryDate)}</div>
                  </div>
                  <ContractStatusBadge expiryDate={contract.expiryDate} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment responsible for</CardTitle>
        </CardHeader>
        <CardContent>
          {specialist.equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">No equipment assigned.</p>
          ) : (
            <div className="space-y-2">
              {specialist.equipment.map((eq) => (
                <div key={eq.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium capitalize">{eq.type} unit</div>
                    <div className="text-muted-foreground">{eq.location}</div>
                  </div>
                  {eq.nextGrainChangeDue && (
                    <span className="text-muted-foreground">
                      Grain change due {formatDate(eq.nextGrainChangeDue)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
