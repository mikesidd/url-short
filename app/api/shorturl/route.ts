import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
  const urls = await prisma.shortUrl.findMany({
    orderBy: { createdAt: 'desc' },
    include: { clicks: true },
  });
  // हर URL के लिए unique IPs की गिनती
  const urlsWithClicks = urls.map(url => ({
    ...url,
    clickCount: new Set(url.clicks.map(c => c.ip)).size,
  }));
  return NextResponse.json(urlsWithClicks);
}

// POST: नया short URL बनाओ (public)
export async function POST(request: Request) {
  const { targetUrl } = await request.json();
  if (!targetUrl) {
    return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
  }
  let shortId = generateShortId();
  // Ensure unique
  while (await prisma.shortUrl.findUnique({ where: { shortId } })) {
    shortId = generateShortId();
  }
  const url = await prisma.shortUrl.create({ data: { shortId, targetUrl } });
  return NextResponse.json(url);
}

// PATCH: edit short URL target (public)
export async function PATCH(request: Request) {
  const { id, targetUrl } = await request.json();
  if (!id || !targetUrl) {
    return NextResponse.json({ error: 'ID and new target URL required' }, { status: 400 });
  }
  const url = await prisma.shortUrl.findUnique({ where: { id } });
  if (!url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const updated = await prisma.shortUrl.update({ where: { id }, data: { targetUrl } });
  return NextResponse.json(updated);
}

// DELETE: delete short URL (public)
export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  const url = await prisma.shortUrl.findUnique({ where: { id } });
  if (!url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.click.deleteMany({ where: { shortId: url.shortId } });
  await prisma.shortUrl.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 