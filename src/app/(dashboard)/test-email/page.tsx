"use client";

import { useState } from "react";
import { Mail, Check, AlertTriangle } from "lucide-react";

export default function TestEmailPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const testEmail = async (type: 'admin' | 'quote') => {
    setLoading(type);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: data.message });
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send email' });
      }
         } catch {
       setResult({ type: 'error', message: 'Network error occurred' });
     } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Email Testing</h1>
          <p className="text-sm md:text-base text-gray-600">
            Test the email notification system
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">Test Email Functions</h2>
            
            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm md:text-base font-medium text-gray-900">Admin Notification</p>
                <p className="text-xs md:text-sm text-gray-600">
                  Tests the email sent to admin when a new quote is created
                </p>
                <button
                  onClick={() => testEmail('admin')}
                  disabled={loading !== null}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{loading === 'admin' ? 'Sending...' : 'Test Admin Email'}</span>
                </button>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="text-sm md:text-base font-medium text-gray-900">Customer Quote Email</p>
                <p className="text-xs md:text-sm text-gray-600">
                  Tests the email sent to customers when quote status changes to QUOTED
                </p>
                <button
                  onClick={() => testEmail('quote')}
                  disabled={loading !== null}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{loading === 'quote' ? 'Sending...' : 'Test Quote Email'}</span>
                </button>
              </div>
            </div>

            {result && (
              <div className={`flex items-start space-x-2 p-3 rounded-lg border ${
                result.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {result.type === 'success' ? (
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  result.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-medium text-gray-900">Setup Instructions</h2>
            <p className="text-xs md:text-sm text-gray-600">
              To enable email notifications:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-xs font-mono text-gray-800">
                RESEND_API_KEY=&quot;re_your_api_key_here&quot;
              </code>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Add this to your .env or .env.local file. Get your API key from{' '}
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                resend.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 