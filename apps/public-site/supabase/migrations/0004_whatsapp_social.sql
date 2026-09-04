-- The hero section's vertical social bar needs a WhatsApp link alongside the
-- existing Facebook/LinkedIn fields; site_settings had no column for it yet.
alter table public.site_settings
  add column if not exists social_whatsapp text;
