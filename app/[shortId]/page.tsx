import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    shortId: string;
  };
}

export default async function ShortRedirectPage({ params }: PageProps) {
  const { shortId } = await Promise.resolve(params);
  const url = await prisma.shortUrl.findUnique({ where: { shortId } });
  
  if (url) {
    const forwarded = headers().get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    await prisma.click.create({ data: { shortId, ip } });
    redirect(url.targetUrl);
  }
  
  return <div className="text-center mt-20 text-2xl">Short URL not found.</div>;
} 