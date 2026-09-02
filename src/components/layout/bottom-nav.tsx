"use client";

import { Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ENTREES = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/conversation", label: "Conversation", Icon: MessageCircle },
  { href: "/profil", label: "Profil", Icon: User },
] as const;

/** Navigation principale — trois entrées, conformément au plan MVP §6.1. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="flex items-center justify-around border-t px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{
        background: "var(--nav-surface)",
        borderColor: "var(--border)",
      }}
    >
      {ENTREES.map(({ href, label, Icon }) => {
        const actif =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={actif ? "page" : undefined}
            className="flex min-w-16 flex-col items-center gap-1 rounded-md py-1 outline-none focus-visible:ring-2"
            style={{ color: actif ? "var(--nav-active)" : "var(--nav-muted)" }}
          >
            <Icon size={20} strokeWidth={actif ? 2.25 : 1.75} aria-hidden />
            <span className="text-xs">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
