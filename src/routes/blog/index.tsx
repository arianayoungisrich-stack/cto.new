import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "Reply AI";
  } catch {
    return "Reply AI";
  }
});

const getBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { execSync } = await import("node:child_process");
  try {
    const result = execSync('team-db "SELECT id, title, slug, excerpt, author, published_at FROM blog_posts ORDER BY published_at DESC"').toString();
    return JSON.parse(result) as any[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
});

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    return {
      businessName: await getBusinessName(),
      posts: await getBlogPosts(),
    };
  },
  head: () => ({
    meta: [
      { title: "Blog — Reply AI | AI Lead Follow-Up Insights" },
      { name: "description", content: "Learn how AI is transforming lead generation and follow-up for local service businesses." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { businessName, posts } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">{businessName}</span>
            </Link>
            <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <Link to="/blog" className="text-indigo-600 font-bold">Blog</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Insights & Strategy</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Deep dives into how AI is helping local businesses capture more leads and grow their revenue.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                to="/blog/$slug" 
                params={{ slug: post.slug }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="aspect-video bg-slate-100 flex items-center justify-center border-b border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v6h6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13H8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17H8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9H8" /></svg>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">
                    {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <span className="text-sm font-medium text-slate-400">By {post.author}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <h2 className="text-xl font-medium text-slate-400">No posts published yet. Check back soon!</h2>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to see how AI can help your business?</h2>
          <Link to="/" className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all inline-block shadow-lg">
            Get a Free Consultation
          </Link>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-lg font-bold text-white">{businessName}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <div className="text-sm">
              Built with <a href="https://cto.new" className="underline hover:text-white">cto.new</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
