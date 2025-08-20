import { ThreadHeader, ThreadList } from '@/app/components/thread-list';
import { getThreadsForFolder } from '@/lib/email/queries';
import { useEmail } from '@/app/contexts/email-context';
import { Suspense } from 'react';

export function generateStaticParams() {
  const folderNames = [
    'inbox',
    'starred',
    'drafts',
    'sent',
    'archive',
    'trash',
  ];

  return folderNames.map((name) => ({ name }));
}

export default function ThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<ThreadsSkeleton folderName="" />}>
        <Threads params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ThreadsSkeleton({ folderName }: { folderName: string }) {
  return (
    <div className="grow overflow-hidden border-r border-gray-200">
      <ThreadHeader folderName={folderName} />
    </div>
  );
}

async function Threads({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let { name } = await params;
  let { q } = await searchParams;
  
  // For now, we'll use default credentials - in a real app, this would come from the session
  const credentials = {
    email: process.env.DEFAULT_USER_EMAIL || 'test@trustguid.co',
    password: process.env.DEFAULT_USER_PASSWORD || '',
  };
  
  let threads = await getThreadsForFolder(name, credentials);

  return <ThreadList folderName={name} threads={threads} searchQuery={q} />;
}
