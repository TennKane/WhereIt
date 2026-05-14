"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { deleteLocation, updateLocation } from "@/lib/actions/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  id: string;
  name: string;
  zoneCount: number;
  storageCount: number;
}

export function LocationCard({ id, name, zoneCount, storageCount }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [delState, delAction, delPending] = useActionState(deleteLocation, {
    success: false, message: "",
  } as const);
  const [renState, renAction, renPending] = useActionState(updateLocation, null);

  if (delState.success && deleteOpen) {
    setDeleteOpen(false);
    setConfirmText("");
  }

  return (
    <>
      <Card className="relative group">
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

        <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.preventDefault(); setRenameOpen(true); }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-red-500"
            onClick={(e) => { e.preventDefault(); setDeleteOpen(true); }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </Card>

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="重命名场所">
        <form action={renAction}>
          <input type="hidden" name="id" value={id} />
          <Input
            name="name"
            defaultValue={name}
            className="mb-3"
            autoFocus
          />
          {renState?.fieldErrors?.name && (
            <p className="mb-3 text-sm text-red-500">{renState.fieldErrors.name[0]}</p>
          )}
          {renState?.message && !renState?.success && (
            <p className="mb-3 text-sm text-red-500">{renState.message}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={renPending}>
              {renPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setConfirmText(""); }} title="删除场所">
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

        <form action={delAction}>
          <input type="hidden" name="id" value={id} />
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="确认删除"
            className="mb-3"
            autoFocus
          />
          {delState.message && (
            <p className="mb-3 text-sm text-red-500">{delState.message}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setDeleteOpen(false); setConfirmText(""); }}>
              取消
            </Button>
            <Button type="submit" variant="danger" disabled={confirmText !== "确认删除" || delPending}>
              {delPending ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
