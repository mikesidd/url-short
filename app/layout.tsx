import './globals.css';
import type { Metadata } from 'next';
import SessionWrapper from './SessionWrapper';

export const metadata: Metadata = {
  title: 'URL Redirect Manager',
  description: 'Manage unlimited URL redirects easily.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
} 