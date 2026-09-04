import { ArrowUpRight } from "lucide-react";

type ProjectCardProps = {
  category: string;
  title: string;
  description: string;
  image: string;
};

export function ProjectCard({ category, title, description, image }: ProjectCardProps) {
  return (
    <article className="reveal overflow-hidden rounded-[22px] border border-white/10 bg-[#0d111a] transition duration-300 hover:-translate-y-1 hover:border-[#3d7cff]/35">
      <div className="h-[220px] bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
      <div className="p-[22px]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[#7f899b]">{category}</div>
        <h3 className="mt-2 text-[21px] font-semibold">{title}</h3>
        <p className="mt-3 text-[13px] leading-6 text-[#98a1b3]">{description}</p>
        <div className="mt-5 flex items-center justify-between text-[12px] text-[#dfe5ef]">
          View project <ArrowUpRight size={16} />
        </div>
      </div>
    </article>
  );
}
