"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import {
  getPost,
  getComments,
  addComment,
  toggleLike,
  getLikeStatus,
} from "@/lib/api";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    getPost(Number(id)).then(setPost);
    getComments(Number(id)).then(setComments);

    if (token) {
      getLikeStatus(token, Number(id)).then((data) => {
        setLiked(data.liked);
        setLikeCount(data.count);
      });
    }
  }, [id]);

  async function handleLike() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const data = await toggleLike(token, Number(id));
    setLiked(data.liked);
    setLikeCount(data.count);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !newComment.trim()) return;

    const comment = await addComment(token, Number(id), newComment);
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  }

  if (!post) return null;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/posts"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mb-8 inline-block"
        >
          ← Zurück
        </Link>
        <p className="text-sm text-zinc-400 mb-2">
          {post.author} · {new Date(post.createdAt).toLocaleDateString("de-DE")}
        </p>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          {post.title}
        </h1>
        <div
          className="text-zinc-600 dark:text-zinc-400 mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Likes */}
        <div className="flex items-center gap-3 mb-12 border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <button
            onClick={handleLike}
            disabled={!isLoggedIn}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              liked
                ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950 dark:border-red-800"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {liked ? "❤️" : "🤍"} {likeCount}
          </button>
          {!isLoggedIn && (
            <span className="text-sm text-zinc-400">
              <Link href="/login" className="underline">
                Einloggen
              </Link>{" "}
              um zu liken
            </span>
          )}
        </div>

        {/* Kommentare */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            Kommentare ({comments.length})
          </h2>

          {isLoggedIn && (
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Schreibe einen Kommentar..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none mb-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Kommentieren
              </button>
            </form>
          )}

          {!isLoggedIn && (
            <p className="text-sm text-zinc-400 mb-8">
              <Link href="/login" className="underline">
                Einloggen
              </Link>{" "}
              um zu kommentieren
            </p>
          )}

          <div className="flex flex-col gap-6">
            {comments.length === 0 && (
              <p className="text-zinc-400 text-sm">Noch keine Kommentare.</p>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-zinc-100 dark:border-zinc-800 pb-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-zinc-900 dark:text-white">
                    {comment.author}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.createdAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
