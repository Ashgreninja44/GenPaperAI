import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const state = (this as any).state;
    const props = (this as any).props;
    if (state.hasError) {
      let errorMessage = "Something went wrong.";
      
      try {
        // Check if it's a Firestore permission error (JSON string)
        if (state.error?.message.startsWith('{')) {
          const errInfo = JSON.parse(state.error.message);
          if (errInfo.error.includes('insufficient permissions')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in correctly.";
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#3C128D] to-[#8A2CB0]">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Application Error</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl font-bold bg-[#3C128D] text-white hover:bg-[#2A0D63] transition-colors shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
