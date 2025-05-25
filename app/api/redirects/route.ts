import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const redirects = await prisma.redirect.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(redirects)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const { sourceUrl, targetUrl } = body

    if (!sourceUrl || !targetUrl) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const redirect = await prisma.redirect.create({
      data: {
        sourceUrl,
        targetUrl,
        userId: session.user.id
      }
    })

    return NextResponse.json(redirect)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 