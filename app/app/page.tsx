'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from "next/image";

interface ShortUrl {
  id: string
  shortId: string
  targetUrl: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/redirects');
      if (!response.ok) throw new Error('Failed to fetch URLs');
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUrls();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      });

      if (!response.ok) throw new Error('Failed to create short URL');
      
      await fetchUrls();
      setNewUrl('');
    } catch (err) {
      console.error('Error creating short URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete URL');
      
      await fetchUrls();
    } catch (err) {
      console.error('Error deleting URL:', err);
    }
  };

  if (status === 'loading') {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">URL Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Shorten'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {urls.map((url) => (
          <div key={url.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{url.shortId}</p>
              <p className="text-sm text-gray-600">{url.targetUrl}</p>
            </div>
            <button
              onClick={() => handleDelete(url.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
