import { searchThreads } from '@/lib/email/queries';
import { formatEmailString, highlightText } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { NavMenu } from '../components/menu';
import { Search } from '../components/search';

async function Threads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let q = (await searchParams).q;
  
  // For now, we'll use default credentials - in a real app, this would come from the session
  const credentials = {
    email: process.env.DEFAULT_USER_EMAIL || 'test@trustguid.co',
    password: process.env.DEFAULT_USER_PASSWORD || '',
  };
  
  let threads = await searchThreads(q, credentials);

  return (
    <div className="h-[calc(100vh-64px)] overflow-auto">
      {threads.map((thread) => {
        const latestEmail = thread.latestEmail;
        const senderInfo = {
          firstName: latestEmail.from.split('@')[0] || '',
          lastName: '',
          email: latestEmail.from,
        };
        
        return (
          <Link
            key={thread.id}
            href={`/f/${thread.folderName.toLowerCase()}/${thread.id}`}
          >
            <div
              className={`flex cursor-pointer items-center border-b border-gray-100 p-4 hover:bg-gray-50`}
            >
              <div className="flex grow items-center overflow-hidden">
                <div className="mr-4 w-[200px] shrink-0">
                  <span className="truncate font-medium">
                    {highlightText(formatEmailString(senderInfo), q)}
                  </span>
                </div>
                <div className="flex grow items-center overflow-hidden">
                  <span className="mr-2 max-w-[400px] min-w-[175px] truncate font-medium">
                    {highlightText(thread.subject, q)}
                  </span>
                  <span className="truncate text-gray-600">
                    {highlightText(latestEmail.body, q)}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex w-40 shrink-0 items-center justify-end">
                <span className="text-sm text-gray-500">
                  {new Date(thread.lastActivityDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  return (
    <div className="flex h-screen">
      <div className="grow overflow-hidden border-r border-gray-200">
        <div className="flex h-[70px] items-center justify-between border-b border-gray-200 p-4">
          <div className="flex w-full items-center">
            <NavMenu />
            <Suspense>
              <Search />
            </Suspense>
          </div>
          <div className="ml-4 flex items-center">
            <Link href="/" passHref>
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </Link>
          </div>
        </div>
        <Suspense>
          <Threads searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
