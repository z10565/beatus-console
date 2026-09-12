import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpecialistForm } from "@/components/specialists/specialist-form";

export default function NewSpecialistPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Onboard specialist</h1>
        <p className="text-sm text-muted-foreground">Add a new specialist to the network.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specialist details</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecialistForm />
        </CardContent>
      </Card>
    </div>
  );
}
