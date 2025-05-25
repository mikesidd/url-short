import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
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
  try {
    const body = await request.json()
    const { sourceUrl, targetUrl } = body

    if (!sourceUrl || !targetUrl) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const redirect = await prisma.redirect.create({
      data: {
        sourceUrl,
        targetUrl
      }
    })

    return NextResponse.json(redirect)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 