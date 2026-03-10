import Link from 'next/link';
import { getPost } from '@/lib/api';
import Header from '@/components/Header';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(Number(id));

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <Header />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/posts" className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mb-8 inline-block">
          ← Zurück
        </Link>
        <p className="text-sm text-zinc-400 mb-2">
          {post.author} · {new Date(post.createdAt).toLocaleDateString('de-DE')}
        </p>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          {post.title}
        </h1>
        <div
          className="prose prose-zinc dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}