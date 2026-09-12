"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Stethoscope,
  Receipt,
  FileText,
  Package,
  LayoutDashboard,
  CalendarPlus,
} from "lucide-react";

const baseLinks = [
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/specialists", label: "Specialists", icon: Stethoscope },
  { href: "/bookings/new", label: "New booking", icon: CalendarPlus },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/equipment", label: "Equipment", icon: Package },
];

export function NavLinks({ isOwner, className }: { isOwner: boolean; className?: string }) {
  const pathname = usePathname();
  const links = isOwner
    ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, ...baseLinks]
    : baseLinks;

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
