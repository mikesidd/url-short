'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Redirect {
  id: string
  sourceUrl: string
  targetUrl: string
  shortId: string
  createdAt: string
}

export default function AppPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [urls, setUrls] = useState<Redirect[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUrls = useCallback(async () => {
    try {
      const response = await fetch('/api/redirects')
      if (!response.ok) throw new Error('Failed to fetch URLs')
      const data = await response.json()
      setUrls(data)
    } catch (err) {
      setError('Failed to load URLs')
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchUrls()
    }
  }, [session, fetchUrls])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: newUrl }),
      })
      if (!response.ok) throw new Error('Failed to create URL')
      const data = await response.json()
      setUrls([...urls, data])
      setNewUrl('')
    } catch (err) {
      setError('Failed to create URL')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete URL')
      setUrls(urls.filter(url => url.id !== id))
    } catch (err) {
      setError('Failed to delete URL')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">URL Redirection Tool</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Redirect'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {urls.map((url) => (
              <div
                key={url.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{url.sourceUrl}</div>
                  <div className="text-sm text-gray-500">{url.targetUrl}</div>
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
        )}
      </div>
    </div>
  )
}
