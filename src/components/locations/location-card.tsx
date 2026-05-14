"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { MapPin, Trash2, X } from "lucide-react";
import { deleteLocation } from "@/lib/actions/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  id: string;
  name: string;
  zoneCount: number;
  storageCount: number;
}

export function LocationCard({ id, name, zoneCount, storageCount }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, formAction, isPending] = useActionState(deleteLocation, {
    success: false,
    message: "",
  } as const);

  const confirmed = confirmText === "确认删除";

  // 成功后关闭弹窗
  if (state.success && open) {
    setOpen(false);
    setConfirmText("");
  }

  return (
    <>
      <Card className="relative">
        <Link href={`/locations/${id}`} className="block">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <MapPin className="size-5 text-primary" />
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {zoneCount} 个区域 · {storageCount} 个储物
            </p>
          </CardContent>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 size-8 text-muted-foreground hover:text-red-500"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">删除场所</h3>
              <button
                onClick={() => { setOpen(false); setConfirmText(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mb-1 text-sm text-muted-foreground">
              确定要删除 <strong>{name}</strong> 吗？
            </p>
            {(zoneCount > 0 || storageCount > 0) && (
              <p className="mb-4 text-sm text-amber-500">
                该场所下所有区域、储物及物品将一并删除，不可恢复。
              </p>
            )}

            <p className="mb-2 text-sm text-muted-foreground">
              请输入 <strong>确认删除</strong> 以确认操作：
            </p>

            <form action={formAction}>
              <input type="hidden" name="id" value={id} />
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="确认删除"
                className="mb-3"
                autoFocus
              />
              {state.message && (
                <p className="mb-3 text-sm text-red-500">{state.message}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setOpen(false); setConfirmText(""); }}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={!confirmed || isPending}
                >
                  {isPending ? "删除中..." : "确认删除"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
