"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLocation } from "@/lib/actions/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface Props {
  locationId: string;
  locationName: string;
}

export function DeleteLocationButton({ locationId, locationName }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, formAction, isPending] = useActionState(deleteLocation, {
    success: false,
    message: "",
  } as const);

  // 成功后关闭
  if (state.success && open) {
    setOpen(false);
    setConfirmText("");
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setConfirmText(""); }} title="删除场所">
        <p className="mb-4 text-sm text-muted-foreground">
          确定要删除 <strong>{locationName}</strong> 吗？
          所有区域、储物及物品将一并删除，不可恢复。
        </p>

        <p className="mb-2 text-sm text-muted-foreground">
          请输入 <strong>确认删除</strong> 以确认操作：
        </p>

        <form action={formAction}>
          <input type="hidden" name="id" value={locationId} />
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
              disabled={confirmText !== "确认删除" || isPending}
            >
              {isPending ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
