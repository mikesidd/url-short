'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

interface ShortUrl {
  id: string
  shortId: string
  targetUrl: string
  createdAt: string
  clickCount: number
  userId?: string
}

export default function Home() {
  const { data: session } = useSession()
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [targetUrl, setTargetUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState('')

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

  useEffect(() => {
    fetchUrls()
  }, [session?.user?.id])

  useEffect(() => {
    if (session) {
      window.location.href = '/app'
    }
  }, [session])

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">URL Shortener</h1>
        <p className="text-lg mb-8">Shorten your URLs with ease</p>
        
        {!session && (
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Image
              src="/google.svg"
              alt="Google logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
} 