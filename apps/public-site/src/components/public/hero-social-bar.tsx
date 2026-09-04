import type { ReactNode } from "react";
import { FacebookIcon, LinkedinIcon, WhatsappIcon } from "./social-icons";

type HeroSocialBarProps = {
  facebook?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
};

export function HeroSocialBar({ facebook, linkedin, whatsapp }: HeroSocialBarProps) {
  const links = [
    facebook && { label: "Facebook", Icon: FacebookIcon, href: facebook },
    linkedin && { label: "LinkedIn", Icon: LinkedinIcon, href: linkedin },
    whatsapp && { label: "WhatsApp", Icon: WhatsappIcon, href: whatsapp },
  ].filter((link): link is { label: string; Icon: typeof FacebookIcon; href: string } => Boolean(link));

  if (links.length === 0) return null;

  const items: ReactNode[] = [];
  links.forEach((link, index) => {
    if (index > 0) items.push(<span key={`divider-${index}`} className="h-6 w-px bg-white/20" />);
    items.push(
      <a
        key={link.label}
        href={link.href}
        target="_blank"
        rel="noreferrer"
        aria-label={link.label}
        className="text-white/85 transition hover:text-[#d4af37]"
      >
        <link.Icon size={18} />
      </a>,
    );
  });

  return <div className="reveal hidden shrink-0 flex-col items-center gap-4 md:flex">{items}</div>;
}
