"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks } from "@/components/nav-links";

export function MobileNav({ isOwner }: { isOwner: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>
            <Image src="/beatusLogo.png" alt="BeATUS Console" width={137} height={84} className="h-auto w-full max-w-[140px]" />
          </SheetTitle>
        </SheetHeader>
        <div className="px-2" onClick={() => setOpen(false)}>
          <NavLinks isOwner={isOwner} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
