import { db } from "@/lib/db";
import { BookingForm } from "@/components/bookings/booking-form";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; specialistId?: string }>;
}) {
  const { clientId, specialistId } = await searchParams;

  const [clients, specialists] = await Promise.all([
    db.client.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
    db.specialist.findMany({
      where: { status: "active" },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, region: true, specialty: true, location: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New booking</h1>
        <p className="text-sm text-muted-foreground">
          Schedule a session and optionally generate an invoice right away.
        </p>
      </div>
      <BookingForm
        clients={clients}
        specialists={specialists}
        defaultClientId={clientId ?? ""}
        defaultSpecialistId={specialistId ?? ""}
      />
    </div>
  );
}
