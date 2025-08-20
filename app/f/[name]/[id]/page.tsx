import { LeftSidebar } from '@/app/components/left-sidebar';
import { ThreadActions } from '@/app/components/thread-actions';
import { getEmailsForThread } from '@/lib/email/queries';
import { notFound } from 'next/navigation';

export default async function EmailPage({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}) {
  let { name, id } = await params;
  
  // For now, we'll use default credentials - in a real app, this would come from the session
  const credentials = {
    email: process.env.DEFAULT_USER_EMAIL || 'test@trustguid.co',
    password: process.env.DEFAULT_USER_PASSWORD || '',
  };
  
  let thread = await getEmailsForThread(id, credentials);

  if (!thread || thread.emails.length === 0) {
    notFound();
  }

  return (
    <div className="flex h-full grow">
      <LeftSidebar />
      <div className="grow overflow-auto p-2 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mx-6 mb-6 flex flex-col items-start justify-between sm:flex-row">
            <h1 className="mt-4 max-w-2xl grow pr-4 text-2xl font-semibold sm:mt-0">
              {thread.subject}
            </h1>
            <div className="mt-2 flex shrink-0 items-center space-x-1 sm:mt-0">
              <button className="mr-2 cursor-pointer text-sm font-medium text-gray-700">
                Share
              </button>
              <ThreadActions 
                threadId={thread.id} 
                folderName={name}
                uid={thread.emails[0]?.uid}
              />
            </div>
          </div>
          <div className="space-y-6">
            {thread.emails.map((email) => (
              <div key={email.id} className="rounded-lg bg-gray-50 px-6 py-4">
                <div className="mb-2 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                  <div className="font-semibold">
                    {email.from} to{' '}
                    {email.to.join(', ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(email.date).toLocaleString()}
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{email.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
