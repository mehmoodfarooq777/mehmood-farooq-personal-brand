import type { MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '../data/siteConfig';
import { ExecutiveImage } from './ExecutiveImage';

interface BlogPreviewSectionProps {
  posts: BlogPost[];
  onNavigate?: (path: string) => void;
}

export function BlogPreviewSection({
  posts,
  onNavigate,
}: BlogPreviewSectionProps) {
  const visiblePosts = posts.filter((p) => p.isPublished).slice(0, 3);
  if (visiblePosts.length === 0) return null;

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!onNavigate) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <section
      id="insights"
      className="border-b border-white/10 bg-[#0C0C0C] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              Editorial &amp; Insights
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4] text-balance sm:text-4xl lg:text-5xl">
              Articles by Mehmood Farooq
            </h2>
            <div className="mt-6 h-px w-16 bg-[#D4AF37]/60" aria-hidden="true" />
          </div>

          <a
            href="/blog"
            onClick={(e) => handleNav(e, '/blog')}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase transition-colors hover:text-[#F2D675] shrink-0"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col justify-between border border-white/10 bg-[#151515] transition-colors duration-200 hover:border-[#D4AF37]/50"
            >
              <div>
                <a
                  href={`/blog/${post.slug}`}
                  onClick={(e) => handleNav(e, `/blog/${post.slug}`)}
                  className="block aspect-video w-full overflow-hidden border-b border-white/10 bg-[#080808]"
                >
                  <ExecutiveImage
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    width={960}
                    height={540}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                    fallbackTitle={post.title}
                  />
                </a>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#9E9E98]">
                    <span className="text-[#D4AF37]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.publishedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {post.readTimeMinutes} min read
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight text-[#F5F5F4] transition-colors group-hover:text-[#F2D675]">
                    <a
                      href={`/blog/${post.slug}`}
                      onClick={(e) => handleNav(e, `/blog/${post.slug}`)}
                    >
                      {post.title}
                    </a>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3] line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <a
                  href={`/blog/${post.slug}`}
                  onClick={(e) => handleNav(e, `/blog/${post.slug}`)}
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase transition-colors hover:text-[#F2D675]"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
