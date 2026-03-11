"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile, searchPosts } from "@/lib/api";

interface Profile {
  username: string;
  displayName: string | null;
  avatar: string | null;
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: number; title: string; content: string }[]
  >([]);

  async function handleSearchInput(q: string) {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchPosts(q);
      setSuggestions(results.slice(0, 5));
    } catch {
      setSuggestions([]);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getProfile(token)
        .then(setProfile)
        .catch(() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setProfile(null);
    router.push("/");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/posts?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchQuery("");
    }
  }
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-zinc-900 dark:text-white shrink-0"
        >
          mein blog
        </Link>

        {/* Suchfeld */}
        <form
          onSubmit={handleSearch}
          className="flex-1 flex items-center justify-end relative"
        >
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${searchOpen ? "w-full" : "w-8"}`}
          >
            {searchOpen && (
              <div className="relative w-full">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchInput(e.target.value);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchQuery) setSearchOpen(false);
                      setSuggestions([]);
                    }, 150);
                  }}
                  placeholder="Suchen..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                {/* Vorschläge */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        onClick={() => {
                          setSuggestions([]);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex flex-col px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {post.title}
                        </span>
                        <span
                          className="text-xs text-zinc-400 line-clamp-1 mt-0.5"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              type={searchOpen ? "submit" : "button"}
              onClick={() => setSearchOpen(true)}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors shrink-0"
            >
              🔍
            </button>
          </div>
        </form>

        <nav className="flex gap-4 text-sm items-center shrink-0">
          <Link
            href="/posts"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Posts
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {profile?.avatar ? (
                  <Image
                    src={`http://127.0.0.1:8000/uploads/avatars/${profile.avatar}`}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {(profile?.displayName ||
                      profile?.username ||
                      "?")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-zinc-900 dark:text-white font-medium">
                  {profile?.displayName || profile?.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
