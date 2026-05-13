import { addFurniture } from "@/lib/actions/furniture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewFurniturePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/rooms/${roomId}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回房间
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>添加家具</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addFurniture} className="space-y-4">
            <input type="hidden" name="roomId" value={roomId} />

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                家具名称
              </label>
              <Input
                id="name"
                name="name"
                placeholder="例如：茶几、衣柜、书架"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="layers"
                className="mb-1.5 block text-sm font-medium"
              >
                层数
              </label>
              <Input
                id="layers"
                name="layers"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                设置 1 表示无分层，大于 1 会显示对应的层
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium"
              >
                备注（可选）
              </label>
              <Input
                id="description"
                name="description"
                placeholder="尺寸、颜色等"
              />
            </div>

            <Button type="submit" className="w-full">
              添加
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
