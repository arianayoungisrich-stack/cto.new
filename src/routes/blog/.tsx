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

const getBlogPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { execSync } = await import("node:child_process");
    try {
      const result = execSync(`team-db "SELECT * FROM blog_posts WHERE slug = '${slug}'"`).toString();
      const posts = JSON.parse(result);
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error("Error fetching post:", error);
      return null;
    }
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: params.slug });
    if (!post) throw new Error("Post not found");
    return {
      businessName: await getBusinessName(),
      post,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title} — Reply AI Blog` },
      { name: "description", content: loaderData?.post?.excerpt },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { businessName, post } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
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
              <Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
            </div>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <header className="mb-12">
          <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">
            {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              {post.author[0]}
            </div>
            <span>By {post.author}</span>
          </div>
        </header>

        <div 
          className="prose prose-lg prose-indigo max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-img:rounded-3xl"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
        />

        <footer className="mt-20 pt-12 border-t border-slate-100">
          <div className="bg-slate-50 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Get more insights on how to grow your local business with AI automation.
            </p>
            <Link to="/" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all inline-block shadow-lg">
              Get a Free Consultation
            </Link>
          </div>
        </footer>
      </article>

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
