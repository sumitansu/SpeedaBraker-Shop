import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Speedabraker Shop uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('speedabraker_saved_config');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-sans text-neutral-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">
              An unexpected error occurred while rendering the configuration workbench.
            </p>
            {this.state.error?.message && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 mb-5 text-left">
                <p className="text-[11px] font-mono text-neutral-700 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
