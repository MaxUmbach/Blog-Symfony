'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api';

interface Profile {
  username: string;
  displayName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  avatar: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    getProfile(token).then((data) => {
      setProfile(data);
      setDisplayName(data.displayName || '');
      setBio(data.bio || '');
      setWebsiteUrl(data.websiteUrl || '');
    }).catch(() => router.push('/login'));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      await updateProfile(token, { displayName, bio, websiteUrl });
      setMessage('Profil gespeichert!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const token = localStorage.getItem('token');
    if (!file || !token) return;

    try {
      const data = await uploadAvatar(token, file);
      setProfile((prev) => prev ? { ...prev, avatar: data.avatar } : prev);
      setMessage('Avatar aktualisiert!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Fehler beim Upload.');
    }
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <section className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Mein Profil</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-2xl font-bold text-zinc-600 dark:text-zinc-300">
            {profile.avatar ? (
              <img
                src={`http://127.0.0.1:8000/uploads/avatars/${profile.avatar}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              (profile.displayName || profile.username)[0].toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Profilbild ändern</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="text-sm text-zinc-600 dark:text-zinc-400"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Anzeigename
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Website
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          {message && <p className="text-sm text-green-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </form>
      </section>
    </main>
  );
}