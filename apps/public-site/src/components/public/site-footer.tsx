import { getVisibleNavigation } from "@/lib/content/navigation";
import { getSiteSettings } from "@/lib/content/site-settings";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "./social-icons";

const defaultBackground =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1800&q=80";

export async function SiteFooter() {
  const [nav, settings] = await Promise.all([getVisibleNavigation(), getSiteSettings()]);
  const description = [settings.tagline, settings.footer_note].filter(Boolean).join(" ");

  // Each icon appears only when its field is filled in Settings → Social — the
  // same rule the header socials and member cards follow, so an unset network
  // leaves no dead link behind.
  const socials = [
    { label: "Facebook", href: settings.social_facebook, Icon: FacebookIcon },
    { label: "Instagram", href: settings.social_instagram, Icon: InstagramIcon },
    { label: "LinkedIn", href: settings.social_linkedin, Icon: LinkedinIcon },
    { label: "YouTube", href: settings.social_youtube, Icon: YoutubeIcon },
    { label: "GitHub", href: settings.social_github, Icon: GithubIcon },
    { label: "WhatsApp", href: settings.social_whatsapp, Icon: WhatsappIcon },
  ].filter((social): social is { label: string; href: string; Icon: typeof FacebookIcon } =>
    Boolean(social.href),
  );

  return (
    <footer
      id="forum"
      className="border-t border-white/10 py-9"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,12,0.82), rgba(5,7,12,0.94)), url('${defaultBackground}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container-shell">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[22px] font-bold tracking-[-0.04em]">
              ROBO<span className="text-[#ff3b46]">SUST</span>
            </div>
            {description && (
              <p className="mt-2 max-w-[340px] text-[12px] leading-6 text-[#98a1b3]">{description}</p>
            )}
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#b9c1ce]">
              {nav.footer.map((item) => (
                <a key={item.id} href={item.url} className="transition hover:text-[#d4af37]">
                  {item.label}
                </a>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-[#aeb7c7] transition hover:-translate-y-0.5 hover:border-[#d4af37]/70 hover:text-[#d4af37]"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 border-t border-white/10 pt-4 text-[11px] text-[#697386]">
          © {new Date().getFullYear()} RoboSUST. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
