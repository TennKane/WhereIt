"use client";

import { Home, Search, Plus, MapPin, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { LocationCreateForm } from "@/components/forms/location-create-form";
import { logout } from "@/lib/actions/auth";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [logoutState, logoutAction, logoutPending] = useActionState(logout, null);

  useEffect(() => {
    if (logoutState?.success) {
      window.location.href = "/login";
    }
  }, [logoutState]);

  // Don't show navbar on auth pages
  if (pathname === "/login" || pathname === "/register") return null;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (value.trim().length >= 1) {
      timerRef.current = setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      }, 400);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg shrink-0"
          >
            <Home className="size-5" />
            <span className="hidden sm:inline">WhereIt</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={handleInputChange}
                placeholder="搜索物品..."
                className="pl-9 h-9"
              />
            </div>
          </form>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">首页</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/locations">
                <MapPin className="size-4" />
                场所
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" />
              新建
            </Button>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit" disabled={logoutPending}>
                <LogOut className="size-4" />
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="新建场所">
        <LocationCreateForm onSuccess={() => setNewOpen(false)} />
      </Modal>
    </>
  );
}
