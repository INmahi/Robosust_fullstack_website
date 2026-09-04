import { getVisibleNavigation } from "@/lib/content/navigation";
import { getSiteSettings } from "@/lib/content/site-settings";

const defaultBackground =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1800&q=80";

export async function SiteFooter() {
  const [nav, settings] = await Promise.all([getVisibleNavigation(), getSiteSettings()]);
  const description = [settings.tagline, settings.footer_note].filter(Boolean).join(" ");

  return (
    <footer
      id="forum"
      className="border-t border-white/10 py-[70px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,12,0.82), rgba(5,7,12,0.94)), url('${defaultBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container-shell">
        <div className="reveal flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[30px] font-bold tracking-[-0.04em]">
              ROBO<span className="text-[#ff3b46]">SUST</span>
            </div>
            {description && <p className="mt-4 max-w-[350px] text-[13px] leading-7 text-[#98a1b3]">{description}</p>}
          </div>
          <div className="flex flex-wrap gap-6 text-[13px] text-[#b9c1ce]">
            {nav.footer.map((item) => (
              <a key={item.id} href={item.url}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-[70px] border-t border-white/10 pt-5 text-[11px] text-[#697386]">
          © {new Date().getFullYear()} RoboSUST. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
