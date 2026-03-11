"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { getPosts, searchPosts } from "@/lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      getPosts().then(setPosts);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchPosts(query)
        .then(setPosts)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            {query ? `Suche: "${query}"` : "Alle Posts"}
          </h1>
        </div>

        <div className="flex flex-col gap-8">
          {posts.length === 0 && !loading && (
            <p className="text-zinc-400">Keine Posts gefunden.</p>
          )}
          {posts.map((post) => (
            <article
              key={post.id}
              className="border-b border-zinc-100 dark:border-zinc-800 pb-8"
            >
              <p className="text-sm text-zinc-400 mb-2">
                {post.author} ·{" "}
                {new Date(post.createdAt).toLocaleDateString("de-DE")}
              </p>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                <Link
                  href={`/posts/${post.id}`}
                  className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
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
