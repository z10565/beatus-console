import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { isGrainChangeDueSoon } from "@/lib/derived";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

const SERVICE_LINE_LABELS: Record<string, string> = {
  session: "Sessions",
  equipment: "Equipment",
  training: "Training",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "owner") redirect("/clients");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    sessionsThisMonth,
    lineItemsThisMonth,
    allInvoices,
    activeSpecialists,
    sessionsForWorkload,
    equipmentList,
  ] = await Promise.all([
    db.session.count({
      where: { scheduledAt: { gte: monthStart, lt: monthEnd }, status: { not: "cancelled" } },
    }),
    db.invoiceLineItem.findMany({
      where: { invoice: { issueDate: { gte: monthStart, lt: monthEnd } } },
      select: { type: true, amount: true },
    }),
    db.invoice.findMany({
      include: { client: true },
    }),
    db.specialist.findMany({
      where: { status: "active" },
      select: { region: true },
    }),
    db.session.findMany({
      where: { scheduledAt: { gte: monthStart, lt: monthEnd }, status: { not: "cancelled" } },
      include: { specialist: true },
    }),
    db.equipment.findMany({ include: { responsibleSpecialist: true } }),
  ]);

  const revenueByLine: Record<string, number> = { session: 0, equipment: 0, training: 0 };
  for (const li of lineItemsThisMonth) {
    revenueByLine[li.type] += parseFloat(li.amount.toString());
  }
  const revenueThisMonth = Object.values(revenueByLine).reduce((a, b) => a + b, 0);
  const revenueChartData = Object.entries(revenueByLine).map(([type, amount]) => ({
    name: SERVICE_LINE_LABELS[type],
    amount: Math.round(amount * 100) / 100,
  }));

  const outstandingInvoices = allInvoices.filter((inv) => {
    if (inv.status === "paid" || inv.status === "draft") return false;
    return true; // sent (incl. overdue by due date) counts as outstanding
  });
  const outstandingTotal = outstandingInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.totalAmount.toString()),
    0
  );
  const overdueInvoices = outstandingInvoices.filter((inv) => inv.dueDate.getTime() < now.getTime());

  const lvActive = activeSpecialists.filter((s) => s.region === "LV").length;
  const uaActive = activeSpecialists.filter((s) => s.region === "UA").length;

  const workloadMap = new Map<string, { name: string; count: number }>();
  for (const s of sessionsForWorkload) {
    const entry = workloadMap.get(s.specialistId) ?? { name: s.specialist.fullName, count: 0 };
    entry.count += 1;
    workloadMap.set(s.specialistId, entry);
  }
  const workload = [...workloadMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const equipmentDueSoon = equipmentList.filter((eq) => isGrainChangeDueSoon(eq.nextGrainChangeDue));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview for {now.toLocaleString("en-GB", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions this month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{sessionsThisMonth}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue this month
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(revenueThisMonth)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">
              {formatCurrency(outstandingTotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              {outstandingInvoices.length} invoice{outstandingInvoices.length === 1 ? "" : "s"} ·{" "}
              {overdueInvoices.length} overdue
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active specialists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeSpecialists.length}</div>
            <div className="text-xs text-muted-foreground">
              {lvActive} in Latvia · {uaActive} in Ukraine
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by service line</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Specialist workload this month</CardTitle>
          </CardHeader>
          <CardContent>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions booked this month yet.</p>
            ) : (
              <div className="space-y-2">
                {workload.map((w, i) => (
                  <Link
                    key={w.id}
                    href={`/specialists/${w.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:border-primary"
                  >
                    <span>
                      <span className="text-muted-foreground">{i + 1}.</span> {w.name}
                    </span>
                    <span className="font-medium">
                      {w.count} session{w.count === 1 ? "" : "s"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outstanding invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {outstandingInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing outstanding right now.</p>
            ) : (
              <div className="space-y-2">
                {outstandingInvoices.slice(0, 8).map((inv) => {
                  const overdue = inv.dueDate.getTime() < now.getTime();
                  return (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:border-primary ${
                        overdue ? "border-destructive/50 bg-destructive/5" : ""
                      }`}
                    >
                      <span>{inv.client.fullName}</span>
                      <span className="flex items-center gap-2">
                        {formatCurrency(inv.totalAmount.toString())}
                        {overdue && <Badge variant="destructive">Overdue</Badge>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment due for grain change</CardTitle>
          </CardHeader>
          <CardContent>
            {equipmentDueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing due in the next 14 days.</p>
            ) : (
              <div className="space-y-2">
                {equipmentDueSoon.map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm">
                    <span>
                      {eq.type} · {eq.location}
                    </span>
                    <span className="text-muted-foreground">
                      Due {eq.nextGrainChangeDue ? formatDate(eq.nextGrainChangeDue) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
