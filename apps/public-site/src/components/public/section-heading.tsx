type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string | null;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-head reveal mb-[38px] flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#8e98aa]">{eyebrow}</div>
        )}
        <h2 className="text-[clamp(36px,5vw,64px)] font-bold leading-[0.95] tracking-[-0.045em]">{title}</h2>
      </div>
      {description && <p className="max-w-[440px] text-[14px] leading-7 text-[#98a1b3]">{description}</p>}
    </div>
  );
}
