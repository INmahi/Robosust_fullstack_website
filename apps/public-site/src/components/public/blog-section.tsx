import { ArrowUpRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/content/blog-posts";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { SectionHeading } from "./section-heading";

export async function BlogSection() {
  const [section, posts] = await Promise.all([getHomeSectionByKey("blog"), getPublishedBlogPosts(3)]);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="blog py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "05 / Field notes"}
          title={section?.heading || "Inside the lab."}
          description={section?.subheading}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => {
            const date = new Date(post.created_at).toLocaleDateString("en-US", {
              month: "2-digit",
              year: "2-digit",
            });
            const label = post.category ? `${post.category} / ${date}` : date;
            return (
              <article
                key={post.id}
                className="reveal overflow-hidden rounded-[22px] border border-white/10 bg-[#0d111a] transition duration-300 hover:-translate-y-1 hover:border-[#3d7cff]/35"
              >
                {post.image_url && (
                  <div className="h-[190px] bg-cover bg-center" style={{ backgroundImage: `url('${post.image_url}')` }} />
                )}
                <div className="p-[22px]">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#7f899b]">{label}</div>
                  <h3 className="mt-2 text-[21px] font-semibold">{post.title}</h3>
                  {post.excerpt && <p className="mt-3 text-[13px] leading-6 text-[#98a1b3]">{post.excerpt}</p>}
                  <div className="mt-5 flex items-center justify-between text-[12px] text-[#dfe5ef]">
                    Read article <ArrowUpRight size={16} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
