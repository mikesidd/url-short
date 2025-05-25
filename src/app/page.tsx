import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import RedirectForm from '@/components/RedirectForm'
import RedirectList from '@/components/RedirectList'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">URL Redirection Tool</h1>
        <RedirectForm />
        <div className="mt-8">
          <RedirectList />
        </div>
      </div>
    </main>
  )
} 