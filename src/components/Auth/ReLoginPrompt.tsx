'use client';
import { useAuth } from '../../hooks/useAuth';

export function ReLoginPrompt() {
  const { showReLoginPrompt, handleReLogin, dismissReLoginPrompt } = useAuth();

  if (!showReLoginPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Session Expired</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Your session has expired due to inactivity or an authentication error. 
            Please log in again to continue using the application.
          </p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              💡 <strong>Tip:</strong> This usually happens when your session expires or when there are server-side authentication changes.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleReLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
}
