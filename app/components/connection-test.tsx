'use client';

import { useState } from 'react';
import { testConnectionAction } from '@/lib/email/actions';
import { useEmail } from '@/app/contexts/email-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, CheckCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';

export function ConnectionTest() {
  const { credentials } = useEmail();
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!credentials) {
      setError('No credentials available');
      return;
    }

    setIsTesting(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('userEmail', credentials.email);
      formData.append('userPassword', credentials.password);

      const result = await testConnectionAction(null, formData);
      
      if (result.success) {
        setResults(result.results);
      } else {
        setError(result.error || 'Test failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsTesting(false);
    }
  };

  if (!credentials) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Connection Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Testing connection for: <strong>{credentials.email}</strong>
        </p>
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          
          <div className="flex items-center space-x-2">
            {results.imap ? (
              <CheckCircledIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            )}
            <span>IMAP: {results.imap ? 'Connected' : 'Failed'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {results.smtp ? (
              <CheckCircledIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            )}
            <span>SMTP: {results.smtp ? 'Connected' : 'Failed'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {results.cpanel ? (
              <CheckCircledIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            )}
            <span>cPanel: {results.cpanel ? 'Connected' : 'Failed'}</span>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start space-x-2">
          <InfoCircledIcon className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Troubleshooting Tips:</p>
            <ul className="mt-1 space-y-1">
              <li>• Verify your email credentials are correct</li>
              <li>• Check if your email server supports IMAP/SMTP</li>
              <li>• Ensure ports 993 (IMAP) and 465 (SMTP) are accessible</li>
              <li>• Some email providers require app-specific passwords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
