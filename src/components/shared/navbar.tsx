"use client";

import { Home, Search, Plus, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
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
              onChange={(e) => setQuery(e.target.value)}
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
            <Link href="/rooms">房间</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/rooms/new">
              <Plus className="size-4" />
              新建
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
