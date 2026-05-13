import { addRoom } from "@/lib/actions/room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRoomPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/rooms"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回房间列表
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>新建房间</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addRoom} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                房间名称
              </label>
              <Input
                id="name"
                name="name"
                placeholder="例如：客厅、厨房、卧室"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              创建
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
