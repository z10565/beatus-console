import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavLinks } from "@/components/nav-links";
import { MobileNav } from "@/components/mobile-nav";
import { GlobalSearch } from "@/components/global-search";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isOwner = session.user.role === "owner";

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-56 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="px-4 py-4">
          <Image src="/beatusLogo.png" alt="BeATUS Console" width={137} height={84} className="h-auto w-full max-w-[140px]" priority />
        </div>
        <div className="flex-1 px-2">
          <NavLinks isOwner={isOwner} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-background px-4 py-3">
          <MobileNav isOwner={isOwner} />
          <Image src="/beatusLogo.png" alt="BeATUS Console" width={98} height={60} className="h-8 w-auto md:hidden" />
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <UserMenu name={session.user.name ?? "User"} role={session.user.role} />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
