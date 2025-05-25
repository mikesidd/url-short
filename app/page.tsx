'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

interface ShortUrl {
  id: string
  shortId: string
  targetUrl: string
  createdAt: string
  clickCount: number
  userId?: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [targetUrl, setTargetUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState('')

  useEffect(() => {
    fetchUrls()
  }, [session])

  const fetchUrls = async () => {
    const res = await fetch('/api/shorturl')
    const data = await res.json()
    // अगर लॉगिन है तो सिर्फ अपने URLs दिखाओ, वरना सब
    if (session?.user?.id) {
      setUrls(data.filter((url: ShortUrl) => url.userId === session.user.id))
    } else {
      setUrls(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShortUrl('')
    setCopyMsg('')
    const res = await fetch('/api/shorturl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, userId: session?.user?.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setShortUrl(window.location.origin + '/' + data.shortId)
      setTargetUrl('')
      fetchUrls()
    }
  }

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 1500)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this short URL?')) return
    await fetch('/api/shorturl', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchUrls()
  }

  const handleEdit = (id: string, currentTarget: string) => {
    setEditId(id)
    setEditTarget(currentTarget)
  }

  const handleEditSave = async (id: string) => {
    await fetch('/api/shorturl', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, targetUrl: editTarget }),
    })
    setEditId(null)
    setEditTarget('')
    fetchUrls()
  }

  return (
    <>
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 shadow text-white mb-4">
        <div className="font-bold text-lg tracking-wide">URL Shortener</div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              {session.user.image && (
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
              )}
              <span className="font-semibold">{session.user.name}</span>
              <button onClick={() => signOut()} className="bg-white/20 hover:bg-white/40 px-4 py-1 rounded transition">Logout</button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="bg-white/20 hover:bg-white/40 px-4 py-1 rounded transition font-semibold">Login with Google</button>
          )}
        </div>
      </nav>
      <main className="min-h-screen flex items-center justify-center pt-0">
        <div className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-xl p-8 border border-gray-200 dark:border-gray-800 mt-8">
          {session?.user && (
            <div className="mb-4 text-right text-sm text-gray-600 dark:text-gray-300">
              Showing URLs for <b>{session.user.email}</b>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Paste your long URL:</label>
              <input
                type="url"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com/very/long/url"
                required
                disabled={!session?.user}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full disabled:opacity-60"
              disabled={!session?.user}
            >
              Shorten URL
            </button>
            {!session?.user && (
              <div className="text-center text-red-500 text-sm">Login required to create short URLs</div>
            )}
          </form>
          {shortUrl && (
            <div className="mb-8 flex items-center gap-2 justify-center">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="w-64 p-2 border rounded bg-gray-100 dark:bg-gray-800 text-center"
              />
              <button onClick={handleCopy} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Copy</button>
              {copyMsg && <span className="text-green-600 ml-2">{copyMsg}</span>}
            </div>
          )}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-200">All Short URLs</h2>
            {urls.length === 0 && (
              <p className="text-gray-500 text-center">No short URLs found.</p>
            )}
            {urls.map(url => (
              <div key={url.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 shadow-sm gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <a href={`/${url.shortId}`} target="_blank" className="text-blue-600 dark:text-blue-400 font-semibold underline break-all">{window.location.origin + '/' + url.shortId}</a>
                  {editId === url.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="url"
                        value={editTarget}
                        onChange={e => setEditTarget(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
                      />
                      <button onClick={() => handleEditSave(url.id)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Save</button>
                      <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 break-all">{url.targetUrl}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className="text-xs text-gray-500">Clicks (unique IP): <b>{url.clickCount}</b></span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(url.id, url.targetUrl)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                    <button onClick={() => handleDelete(url.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://siddharthnahar.in"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-full shadow-lg font-semibold text-sm opacity-90 hover:opacity-100 transition-all border-2 border-white/30 backdrop-blur-md hover:scale-105 hover:shadow-2xl"
        >
          Created by Siddharth Nahar
        </a>
      </div>
    </>
  )
} 