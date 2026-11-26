import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application boundary caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-12 text-[#F5F5F4]">
          <div className="w-full max-w-lg border border-[#D4AF37]/30 bg-[#151515] p-8">
            <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/40 bg-[#080808] text-[#D4AF37]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-[#F5F5F4]">
              Something Went Wrong
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B8B8B3]">
              The application encountered an unexpected issue while processing your request.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-7 inline-flex min-h-[44px] items-center gap-2 bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-[#080808] transition-colors hover:bg-[#F2D675]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
