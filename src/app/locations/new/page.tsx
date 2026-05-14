import { LocationCreateForm } from "@/components/forms/location-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewLocationPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/locations"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回场所列表
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>新建场所</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
