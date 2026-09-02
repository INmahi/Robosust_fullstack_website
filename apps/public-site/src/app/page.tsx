import Link from "next/link";
import { getActiveNotices } from "@/lib/content/notices";
import { getSiteSettings } from "@/lib/content/site-settings";

// Placeholder homepage — visual design is intentionally not built yet (see
// IMPLEMENTATION_PLAN.md). This page exists to prove the content-layer
// contract end to end: DB -> src/lib/content/* -> a rendered page, so a
// future frontend rewrite only ever needs to keep calling these functions.
export default async function Home() {
  const [notices, settings] = await Promise.all([getActiveNotices(), getSiteSettings()]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{settings.site_name}</h1>
      {settings.tagline && <p className="mt-1 text-zinc-500">{settings.tagline}</p>}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Notices
        </h2>
        {notices.length === 0 ? (
          <p className="text-sm text-zinc-400">No active notices.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notices.map((notice) => (
              <li
                key={notice.id}
                className={`rounded border px-4 py-3 text-sm ${
                  notice.pinned ? "border-amber-300 bg-amber-50" : "border-zinc-200"
                }`}
              >
                <p className="font-medium">{notice.title}</p>
                {notice.body && <p className="mt-1 text-zinc-600">{notice.body}</p>}
                {notice.link && (
                  <a href={notice.link} className="mt-1 inline-block text-blue-600 hover:underline">
                    Learn more
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-16 text-xs text-zinc-400">
        This is a placeholder page. Manage this site&apos;s content at{" "}
        <Link href="/admin" className="underline">
          /admin
        </Link>
        .
      </p>
    </main>
  );
}
