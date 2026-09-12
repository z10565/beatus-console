import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/client-form";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New client</h1>
        <p className="text-sm text-muted-foreground">Add a new client record.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm defaultName={name ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
