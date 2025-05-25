import { redirect, notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    shortId: string;
  };
}

interface ErrorResponse {
  message: string;
  status?: number;
}

export default async function Page({ params }: PageProps) {
  const { shortId } = params;

  try {
    const redirectData = await prisma.redirect.findUnique({
      where: {
        shortId
      }
    });

    if (!redirectData) {
      notFound();
    }

    // IP निकालो
    const forwarded = (await headers()).get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    // क्लिक रिकॉर्ड करो
    await prisma.click.create({ data: { shortId, ip } });

    redirect(redirectData.targetUrl);
  } catch (error: unknown) {
    // कोई भी error आए तो 500 पर redirect कर दो
    redirect('/500');
  }
} 