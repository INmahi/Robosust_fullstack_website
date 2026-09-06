import {
  Compass,
  Cpu,
  Lightbulb,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// home_section_items.icon holds a plain lowercase name an editor types in
// /admin rather than a component reference, so the CMS never has to know
// about lucide. An unknown or blank name falls back to the default glyph —
// a typo degrades to a generic icon instead of breaking the render.
//
// Keep this list and the field's hint in lib/admin/content-types.ts in sync.
export const SECTION_ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  cpu: Cpu,
  trophy: Trophy,
  rocket: Rocket,
  wrench: Wrench,
  target: Target,
  users: Users,
  zap: Zap,
  compass: Compass,
  sparkles: Sparkles,
};

export const SECTION_ICON_NAMES = Object.keys(SECTION_ICONS);

export const DEFAULT_SECTION_ICON: LucideIcon = Sparkles;

export function resolveSectionIcon(name: string | null | undefined): LucideIcon {
  if (!name) return DEFAULT_SECTION_ICON;
  return SECTION_ICONS[name.trim().toLowerCase()] ?? DEFAULT_SECTION_ICON;
}
