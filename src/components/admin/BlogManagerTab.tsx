import { useState, type FormEvent } from 'react';
import {
  BookOpen,
  ExternalLink,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  DEFAULT_BLOG_POSTS,
  slugifyTitle,
  type BlogPost,
  type MediaCategory,
} from '../../data/siteConfig';
import {
  AdminInput,
  AdminTextarea,
  ImageSlotEditor,
} from './AdminSectionEditors';

interface BlogManagerTabProps {
  posts: BlogPost[];
  saving: boolean;
  onSavePost: (post: BlogPost) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onSeedDefaults: () => Promise<void>;
  onPickImage: (
    title: string,
    category: MediaCategory,
    currentUrl: string,
    onSelect: (url: string) => void
  ) => void;
}

function createBlankPost(): BlogPost {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    category: 'Entrepreneurship',
    coverImageUrl: '',
    coverImageAlt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: 'Mehmood Farooq, TITAN ROUTE DISPATCH (TRD) LLC',
    canonicalUrl: '',
    readTimeMinutes: 4,
    publishedDate: today,
    isPublished: true,
  };
}

export function BlogManagerTab({
  posts,
  saving,
  onSavePost,
  onDeletePost,
  onSeedDefaults,
  onPickImage,
}: BlogManagerTabProps) {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formError, setFormError] = useState('');

  function startNewPost() {
    setFormError('');
    setEditingPost(createBlankPost());
  }

  function startEditPost(post: BlogPost) {
    setFormError('');
    setEditingPost({ ...post });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingPost) return;
    setFormError('');

    const cleanSlug = slugifyTitle(editingPost.slug || editingPost.title);
    if (cleanSlug.length < 2) {
      setFormError('Enter a valid article title or URL slug.');
      return;
    }
    if (editingPost.title.trim().length < 3) {
      setFormError('Article title must be at least 3 characters.');
      return;
    }
    if (editingPost.excerpt.trim().length < 10) {
      setFormError('Excerpt must be at least 10 characters.');
      return;
    }
    if (editingPost.content.trim().length < 20) {
      setFormError('Article body content must be at least 20 characters.');
      return;
    }

    await onSavePost({
      ...editingPost,
      slug: cleanSlug,
      readTimeMinutes: Math.min(
        120,
        Math.max(1, Number(editingPost.readTimeMinutes) || 4)
      ),
    });
    setEditingPost(null);
  }

  const displayedPosts = posts.length > 0 ? posts : [];

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <section className="flex flex-col justify-between gap-4 border border-[#D4AF37]/30 bg-[#151515] p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#F5F5F4]">
            Editorial Blog &amp; Content SEO
          </h2>
          <p className="mt-1 text-xs text-[#9E9E98]">
            Publish original articles on entrepreneurship, US trucking and logistics, and{' '}
            TITAN ROUTE DISPATCH (TRD) LLC. Every published article automatically updates{' '}
            <code>/blog</code>, JSON-LD <code>BlogPosting</code>, and <code>sitemap.xml</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={saving}
            onClick={onSeedDefaults}
            className="inline-flex min-h-[42px] items-center gap-2 border border-white/15 bg-[#080808] px-4 py-2 text-xs font-semibold tracking-wider text-[#D4D4D0] uppercase hover:border-[#D4AF37] hover:text-[#F2D675]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sync Starter Articles</span>
          </button>

          <button
            type="button"
            onClick={startNewPost}
            className="inline-flex min-h-[42px] items-center gap-2 bg-[#D4AF37] px-5 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Write New Article</span>
          </button>
        </div>
      </section>

      {/* Active Editor Form */}
      {editingPost && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-[#D4AF37]/45 bg-[#151515] p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-display text-2xl font-semibold text-[#F5F5F4]">
              {editingPost.id ? 'Edit Article' : 'Compose New Article'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              aria-label="Close article editor"
              className="flex h-9 w-9 items-center justify-center border border-white/15 text-[#B8B8B3] hover:border-[#D4AF37] hover:text-[#F2D675]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {formError && (
            <p
              role="alert"
              className="border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-xs text-rose-200"
            >
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <AdminInput
                label="Article Headline (H1)"
                value={editingPost.title}
                maxLength={160}
                placeholder="e.g. Building Beyond Borders: US Freight Dispatching Insights"
                onChange={(v) =>
                  setEditingPost((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: v,
                          slug: prev.id ? prev.slug : slugifyTitle(v),
                        }
                      : null
                  )
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium tracking-wider text-[#9E9E98] uppercase">
                      URL Slug (/blog/...)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost((prev) =>
                          prev
                            ? { ...prev, slug: slugifyTitle(prev.title) }
                            : null
                        )
                      }
                      className="text-[11px] font-semibold text-[#D4AF37] hover:text-[#F2D675]"
                    >
                      Generate from Title
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={140}
                    value={editingPost.slug}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        slug: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="article-url-slug"
                    className="w-full border border-white/15 bg-[#080808] px-3.5 py-2.5 font-mono text-xs text-[#F5F5F4] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <AdminInput
                  label="Category"
                  value={editingPost.category}
                  maxLength={60}
                  placeholder="Entrepreneurship"
                  onChange={(v) =>
                    setEditingPost({ ...editingPost, category: v })
                  }
                />
              </div>

              <AdminTextarea
                label="Article Excerpt / Summary"
                value={editingPost.excerpt}
                maxLength={400}
                rows={2}
                placeholder="Concise summary displayed on the homepage and blog index."
                onChange={(v) => setEditingPost({ ...editingPost, excerpt: v })}
              />

              <AdminTextarea
                label="Article Content (Supports ## Heading, ### Subheading, - Bullet, **Bold**)"
                value={editingPost.content}
                maxLength={25000}
                rows={12}
                placeholder="## Section Heading&#10;&#10;Write your insights here..."
                onChange={(v) => setEditingPost({ ...editingPost, content: v })}
              />
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div className="border border-white/10 bg-[#0C0C0C] p-4 space-y-4">
                <label className="flex cursor-pointer items-center justify-between text-xs font-semibold tracking-wider uppercase">
                  <span
                    className={
                      editingPost.isPublished
                        ? 'text-[#F2D675]'
                        : 'text-[#9E9E98]'
                    }
                  >
                    {editingPost.isPublished
                      ? 'Published (Public & Indexed)'
                      : 'Private Draft'}
                  </span>
                  <input
                    type="checkbox"
                    checked={editingPost.isPublished}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        isPublished: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#D4AF37]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <AdminInput
                    label="Published Date"
                    type="date"
                    value={editingPost.publishedDate}
                    maxLength={40}
                    onChange={(v) =>
                      setEditingPost({ ...editingPost, publishedDate: v })
                    }
                  />
                  <AdminInput
                    label="Read Time (Min)"
                    type="number"
                    value={String(editingPost.readTimeMinutes)}
                    maxLength={4}
                    onChange={(v) =>
                      setEditingPost({
                        ...editingPost,
                        readTimeMinutes: Number(v) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <ImageSlotEditor
                label="Cover Image"
                url={editingPost.coverImageUrl}
                onChangeUrl={(url) =>
                  setEditingPost({ ...editingPost, coverImageUrl: url })
                }
                onClear={() =>
                  setEditingPost({ ...editingPost, coverImageUrl: '' })
                }
                onOpenPicker={() =>
                  onPickImage(
                    'Select Article Cover Image',
                    'blog',
                    editingPost.coverImageUrl,
                    (url) =>
                      setEditingPost((prev) =>
                        prev ? { ...prev, coverImageUrl: url } : null
                      )
                  )
                }
              />

              <AdminInput
                label="Cover Image Alt Text"
                value={editingPost.coverImageAlt}
                maxLength={240}
                placeholder="Descriptive alt text for Google Images & screen readers"
                onChange={(v) =>
                  setEditingPost({ ...editingPost, coverImageAlt: v })
                }
              />

              <div className="space-y-3 border border-white/10 bg-[#0C0C0C] p-4">
                <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                  Article SEO Overrides
                </p>
                <AdminInput
                  label="SEO Title"
                  value={editingPost.seoTitle}
                  maxLength={160}
                  placeholder="Optional custom <title>"
                  onChange={(v) =>
                    setEditingPost({ ...editingPost, seoTitle: v })
                  }
                />
                <AdminTextarea
                  label="SEO Meta Description"
                  value={editingPost.seoDescription}
                  maxLength={320}
                  rows={2}
                  placeholder="Optional custom meta description"
                  onChange={(v) =>
                    setEditingPost({ ...editingPost, seoDescription: v })
                  }
                />
                <AdminInput
                  label="SEO Keywords"
                  value={editingPost.seoKeywords}
                  maxLength={400}
                  onChange={(v) =>
                    setEditingPost({ ...editingPost, seoKeywords: v })
                  }
                />
                <AdminInput
                  label="Canonical URL Override"
                  value={editingPost.canonicalUrl}
                  maxLength={300}
                  placeholder="Leave blank to auto-use /blog/slug"
                  onChange={(v) =>
                    setEditingPost({ ...editingPost, canonicalUrl: v })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="min-h-[42px] border border-white/15 bg-[#080808] px-5 py-2 text-xs font-semibold tracking-wider text-[#F5F5F4] uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[42px] items-center gap-2 bg-[#D4AF37] px-6 py-2 text-xs font-semibold tracking-wider text-[#080808] uppercase hover:bg-[#F2D675]"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Article'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Articles List */}
      {displayedPosts.length === 0 ? (
        <div className="border border-white/10 bg-[#151515] p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-[#D4AF37]" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl font-semibold text-[#F5F5F4]">
            Using {DEFAULT_BLOG_POSTS.length} Built-In Starter Articles
          </p>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#9E9E98]">
            Your public blog already displays the 3 starter articles. Click &ldquo;Sync Starter Articles&rdquo; above to copy them into your database for custom editing, or write a brand-new article now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {displayedPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col justify-between border border-white/10 bg-[#151515] p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-xs font-medium">
                  <span className="text-[#D4AF37] uppercase tracking-wider">
                    {post.category} · {post.publishedDate}
                  </span>
                  <span
                    className={
                      post.isPublished
                        ? 'font-semibold text-emerald-400'
                        : 'text-[#8C8C86]'
                    }
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-semibold text-[#F5F5F4]">
                  {post.title}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-[#8C8C86]">
                  /blog/{post.slug}
                </p>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#B8B8B3]">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditPost(post)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 bg-[#D4AF37] px-4 py-1.5 text-xs font-semibold text-[#080808] uppercase hover:bg-[#F2D675]"
                  >
                    Edit Article
                  </button>
                  {post.isPublished && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 border border-white/15 bg-[#080808] px-3 py-1.5 text-xs text-[#D4D4D0] hover:border-[#D4AF37] hover:text-[#F2D675]"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onDeletePost(post.id)}
                  aria-label={`Delete ${post.title}`}
                  className="inline-flex min-h-[36px] items-center border border-white/15 px-3 py-1.5 text-xs text-[#B8B8B3] hover:border-rose-500/50 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
