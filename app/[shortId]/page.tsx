import { redirect } from 'next/navigation';
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
    const redirect = await prisma.redirect.findUnique({
      where: {
        shortId
      }
    });

    if (!redirect) {
      return redirect('/');
    }

    // IP निकालो
    const forwarded = (await headers()).get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    // क्लिक रिकॉर्ड करो
    await prisma.click.create({ data: { shortId, ip } });

    return redirect(redirect.targetUrl);
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse;
    return {
      redirect: {
        destination: errorResponse.message === 'URL not found' ? '/404' : '/500',
        permanent: false,
      },
    };
  }
} 