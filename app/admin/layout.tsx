import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Editorial studio",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return children;
}
