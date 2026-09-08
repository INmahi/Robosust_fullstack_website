import { getVisibleNavigation } from "@/lib/content/navigation";
import { HeaderBar } from "./header-bar";

// Server half: reads the CMS nav and hands plain arrays to the client bar,
// which owns the scroll state and all the markup.
export async function SiteHeader() {
  const nav = await getVisibleNavigation();

  return (
    <HeaderBar
      navItems={nav.primary.map((item) => ({ label: item.label, href: item.url }))}
      moreItems={nav.more.map((item) => ({ id: item.id, label: item.label, url: item.url }))}
    />
  );
}
