const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:8000';

export async function getPosts() {
    const res = await fetch(`${API_URL}/api/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
}

export async function getPost(id: number) {
    const res = await fetch(`${API_URL}/api/posts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
}

export async function getHomePosts() {
    const res = await fetch(`${API_URL}/api/home`);
    if (!res.ok) throw new Error('Failed to fetch home posts');
    return res.json();
}

export async function login(username: string, password: string) {
    const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json(); // gibt { token: "..." } zurück
}

export async function register(username: string, password: string) {
    const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
}

export async function getProfile(token: string) {
    const res = await fetch(`${API_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export async function updateProfile(token: string, data: {
    displayName?: string;
    bio?: string;
    websiteUrl?: string;
}) {
    const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
}

export async function uploadAvatar(token: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload avatar');
    return res.json();
}

export async function getComments(postId: number) {
    const res = await fetch(`${API_URL}/api/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
}

export async function addComment(token: string, postId: number, content: string) {
    const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
}

export async function toggleLike(token: string, postId: number) {
    const res = await fetch(`${API_URL}/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
}