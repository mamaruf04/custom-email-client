import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { EmailApp } from './components/email-app';
import { EmailProvider } from './contexts/email-context';
import './globals.css';
import { RightSidebar } from './components/right-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js Mail',
  description: 'An email client template using the Next.js App Router.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-white text-gray-800 ${inter.className}`}>
      <body className="flex h-screen">
        <EmailProvider>
          <EmailApp>
            <main className="grow overflow-hidden">{children}</main>
            <Suspense fallback={<RightSidebarSkeleton />}>
              {/* <RightSidebar userId={1} /> */}
            </Suspense>
          </EmailApp>
        </EmailProvider>
        <Toaster closeButton />
      </body>
    </html>
  );
}

function RightSidebarSkeleton() {
  return (
    <div className="hidden w-[350px] shrink-0 overflow-auto bg-neutral-50 p-6 sm:flex" />
  );
}
