import { ConnectionTest } from './components/connection-test';
import { LeftSidebar } from './components/left-sidebar';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex h-full grow">
      <LeftSidebar />
      <div className="grow p-6">
        <h1 className="mb-6 text-2xl font-semibold">Email Client Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/f/inbox" 
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium">📥 Inbox</h3>
                <p className="text-sm text-gray-600">View your incoming emails</p>
              </Link>
              
              <Link 
                href="/f/inbox/new" 
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium">✉️ Compose</h3>
                <p className="text-sm text-gray-600">Write and send a new email</p>
              </Link>
              
              <Link 
                href="/search" 
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium">🔍 Search</h3>
                <p className="text-sm text-gray-600">Search through your emails</p>
              </Link>
            </div>
          </div>
          
          <div>
            <ConnectionTest />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Important Notes</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use the Connection Test to verify your email server settings</li>
            <li>• Make sure your email credentials are correct</li>
            <li>• Some email providers require app-specific passwords</li>
            <li>• Check that IMAP and SMTP are enabled on your email account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
