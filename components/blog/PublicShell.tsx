import type { ReactNode } from "react";
import { publishedSite } from "@/lib/cms/queries";
import type { SiteConfig } from "@/lib/cms/site-config";
import { PublicFrame } from "./PublicFrame";
export async function PublicShell({
  children,
  config,
  magazine = false,
  headlines = [],
}: {
  children: ReactNode;
  config?: SiteConfig;
  magazine?: boolean;
  headlines?: { title: string; slug: string; published_at: string | null }[];
}) {
  return (
    <PublicFrame
      config={config || (await publishedSite())}
      magazine={magazine}
      headlines={headlines}
    >
      {children}
    </PublicFrame>
  );
}
