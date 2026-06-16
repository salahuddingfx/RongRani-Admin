import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch() {
    // Error boundary caught an error - this will trigger the fallback UI
    this.setState({
      hasError: true
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-maroon text-white px-6 py-3 rounded-lg hover:bg-maroon-dark transition-colors font-medium"
              >
                Refresh Page
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>

            {/* Show error details in development */}
            {import.meta.env.DEV && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Error occurred - check console for details</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;