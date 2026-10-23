import type { ReactNode } from "react";
import { publishedSite } from "@/lib/cms/queries";
import type { SiteConfig } from "@/lib/cms/site-config";
import { PublicFrame } from "./PublicFrame";
export async function PublicShell({
  children,
  config,
}: {
  children: ReactNode;
  config?: SiteConfig;
}) {
  return (
    <PublicFrame config={config || (await publishedSite())}>
      {children}
    </PublicFrame>
  );
}
