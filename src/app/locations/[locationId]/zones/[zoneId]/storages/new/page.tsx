import { db } from "@/lib/db";
import { locations, zones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StorageCreateForm } from "@/components/forms/storage-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewStoragePage({
  params,
}: {
  params: Promise<{ locationId: string; zoneId: string }>;
}) {
  const { locationId, zoneId } = await params;

  const location = await db.select().from(locations).where(eq(locations.id, locationId)).get();
  if (!location) notFound();

  const zone = await db.select().from(zones).where(eq(zones.id, zoneId)).get();
  if (!zone) notFound();

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/locations/${locationId}/zones/${zoneId}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {location.name} → {zone.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>添加储物</CardTitle>
          <p className="text-xs text-muted-foreground">
            {location.name} → {zone.name}
          </p>
        </CardHeader>
        <CardContent>
          <StorageCreateForm zoneId={zoneId} locationId={locationId} />
        </CardContent>
      </Card>
    </div>
  );
}
