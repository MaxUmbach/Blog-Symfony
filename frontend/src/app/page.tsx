import Link from 'next/link';
import Header from '@/components/Header';
import { getHomePosts } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default async function Home() {
  const posts: Post[] = await getHomePosts();

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Willkommen
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Die neuesten Beiträge
        </p>
      </section>

      {/* Posts */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-8">
              <p className="text-sm text-zinc-400 mb-2">
                {post.author} · {new Date(post.createdAt).toLocaleDateString('de-DE')}
              </p>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                <Link href={`/posts/${post.id}`} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <div
                className="text-zinc-600 dark:text-zinc-400 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <Link
                href={`/posts/${post.id}`}
                className="inline-block mt-4 text-sm font-medium text-zinc-900 dark:text-white hover:underline"
              >
                Weiterlesen →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}