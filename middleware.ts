import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // API को कॉल करो जिससे redirect info मिले
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/redirects?sourceUrl=${encodeURIComponent(path)}`
  try {
    const res = await fetch(apiUrl)
    if (res.ok) {
      const redirect = await res.json()
      if (redirect && redirect.targetUrl) {
        return NextResponse.redirect(redirect.targetUrl)
      }
    }
  } catch (error) {
    // fail silently
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} 