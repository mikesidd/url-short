import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

function generateShortId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET: सभी short URLs (click count के साथ)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const urls = await prisma.shortUrl.findMany({
      where: session?.user?.id ? { userId: session.user.id } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(urls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 });
  }
}

// POST: नया short URL बनाओ (सिर्फ authenticated user)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUrl } = await request.json();
    if (!targetUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const shortId = Math.random().toString(36).substring(2, 8);
    const url = await prisma.shortUrl.create({
      data: {
        shortId,
        targetUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(url);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 });
  }
}

// PATCH: edit short URL target (सिर्फ authenticated user)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, targetUrl } = await request.json();
    if (!id || !targetUrl) {
      return NextResponse.json({ error: 'ID and URL are required' }, { status: 400 });
    }

    const url = await prisma.shortUrl.findUnique({
      where: { id },
    });

    if (!url || url.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedUrl = await prisma.shortUrl.update({
      where: { id },
      data: { targetUrl },
    });

    return NextResponse.json(updatedUrl);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 });
  }
}

// DELETE: delete short URL (सिर्फ authenticated user)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const url = await prisma.shortUrl.findUnique({
      where: { id },
    });

    if (!url || url.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.shortUrl.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 });
  }
} 