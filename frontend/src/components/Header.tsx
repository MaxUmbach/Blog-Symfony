'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api';

interface Profile {
  username: string;
  displayName: string | null;
  avatar: string | null;
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      getProfile(token)
        .then(setProfile)
        .catch(() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setProfile(null);
    router.push('/');
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
          mein blog
        </Link>
        <nav className="flex gap-4 text-sm items-center">
          <Link href="/posts" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            Posts
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                    {(profile?.displayName || profile?.username || '?')[0].toUpperCase()}
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
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}