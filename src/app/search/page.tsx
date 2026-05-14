import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq, like } from "drizzle-orm";
import { SearchX, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q || !q.trim()) {
    return (
      <div className="py-16 text-center">
        <SearchX className="mx-auto mb-4 size-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">输入关键词搜索物品</p>
      </div>
    );
  }

  const keyword = q.trim();

  const results = await db
    .select({
      id: items.id,
      name: items.name,
      description: items.description,
      quantity: items.quantity,
      storageName: storages.name,
      zoneName: zones.name,
      locationName: locations.name,
      storageId: items.storageId,
      zoneId: storages.zoneId,
      locationId: zones.locationId,
    })
    .from(items)
    .leftJoin(storages, eq(items.storageId, storages.id))
    .leftJoin(zones, eq(storages.zoneId, zones.id))
    .leftJoin(locations, eq(zones.locationId, locations.id))
    .where(like(items.name, `%${keyword}%`))
    .limit(50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">搜索：{keyword}</h1>
        <p className="text-sm text-muted-foreground">
          找到 {results.length} 个结果
        </p>
      </div>

      {results.length === 0 ? (
        <div className="py-16 text-center">
          <SearchX className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            没有找到包含 &ldquo;{keyword}&rdquo; 的物品
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/locations/${item.locationId}/zones/${item.zoneId}/storages/${item.storageId}`}
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <Package className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {item.name}
                      {(item.quantity ?? 1) > 1 && (
                        <Badge variant="secondary">x{item.quantity}</Badge>
                      )}
                    </CardTitle>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="text-primary font-medium">
                        {item.locationName}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-medium">
                        {item.zoneName}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-medium">
                        {item.storageName}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
