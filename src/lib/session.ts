import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "owner") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
