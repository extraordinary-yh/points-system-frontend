"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Dashboard component error in ${this.props.componentName || 'Unknown'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl bg-gradient-to-br from-red-50 via-white to-red-50 shadow-xl border border-red-200/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-center min-h-[200px] text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-200 shadow-inner">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <FiAlertTriangle className="text-white text-xl" />
                </div>
              </div>
              <h3 className="font-semibold text-red-700 mb-2">
                {this.props.componentName || 'Component'} Error
              </h3>
              <p className="text-sm text-red-600 mb-4">
                Something went wrong loading this component
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                <FiRefreshCw className="text-sm" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for dashboard components
export const withErrorBoundary = (WrappedComponent: React.ComponentType, componentName: string) => {
  const WithErrorBoundaryComponent = (props: any) => (
    <DashboardErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </DashboardErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName})`;
  return WithErrorBoundaryComponent;
};
