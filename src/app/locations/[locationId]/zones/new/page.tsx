import { ZoneCreateForm } from "@/components/forms/zone-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewZonePage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/locations/${locationId}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回场所
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>添加区域</CardTitle>
        </CardHeader>
        <CardContent>
          <ZoneCreateForm locationId={locationId} />
        </CardContent>
      </Card>
    </div>
  );
}
