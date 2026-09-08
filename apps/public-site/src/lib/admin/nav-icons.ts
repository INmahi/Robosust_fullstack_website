// Icon map for content-type nav/dashboard entries. Deliberately its own
// plain module (no "use client") — importing data exports from a client
// component file into a Server Component doesn't reliably carry the real
// value through the RSC boundary, so this can't live inside admin-nav.tsx
// even though only admin-nav.tsx actually needs client interactivity.
import {
  Bell,
  Trophy,
  FolderKanban,
  CalendarDays,
  Newspaper,
  Users2,
  Network,
  UserPlus,
  GraduationCap,
  Images,
  Layers,
  Compass,
  Navigation as NavigationIcon,
  PanelsTopLeft,
  Search,
  MessagesSquare,
  MessageCircle,
  Mail,
  type LucideIcon,
} from "lucide-react";

export const CONTENT_TYPE_ICONS: Record<string, LucideIcon> = {
  notices: Bell,
  achievements: Trophy,
  projects: FolderKanban,
  events: CalendarDays,
  "blog-posts": Newspaper,
  "committee-members": Users2,
  "committee-wings": Network,
  recruitment: UserPlus,
  alumni: GraduationCap,
  "gallery-albums": Images,
  "gallery-images": Images,
  "agp-blocks": Compass,
  "navigation-items": NavigationIcon,
  "home-sections": PanelsTopLeft,
  "home-section-items": Layers,
  "seo-metadata": Search,
  "forum-categories": MessagesSquare,
  "forum-posts": MessageCircle,
  "forum-replies": MessageCircle,
  "contact-submissions": Mail,
};

export const DEFAULT_CONTENT_TYPE_ICON: LucideIcon = Layers;
