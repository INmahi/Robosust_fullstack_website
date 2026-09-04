// Shared Tailwind class strings for the /admin UI. Centralized so the ~10
// admin pages read from one definition instead of each hand-rolling the same
// input/button/card styles slightly differently. Palette (slate neutrals +
// blue-600 accent) and spacing came from the ui-ux-pro-max skill's
// "internal CRUD admin panel" design-system query — light, professional,
// high-contrast, matching what the skill's data flags as best-fit for
// admin panels/internal tools.

export const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-slate-700";

export const buttonPrimaryClass =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondaryClass =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const linkActionClass =
  "inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700";

export const linkDangerClass =
  "inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700";

export const cardClass = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

export const alertErrorClass =
  "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";

export const alertSuccessClass =
  "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700";

export const alertWarningClass =
  "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800";

export const pageHeadingClass = "text-xl font-semibold tracking-tight text-slate-900";

export const pageSubtextClass = "mt-1 text-sm text-slate-500";
