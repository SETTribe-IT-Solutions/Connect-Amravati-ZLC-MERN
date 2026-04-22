import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <Container>
            <Card className="border-0 shadow-lg p-5 text-center mx-auto" style={{ maxWidth: '600px', borderRadius: '1rem' }}>
              <div className="mb-4 text-danger">
                <FaExclamationTriangle size={64} />
              </div>
              <h2 className="display-6 fw-bold mb-3 text-dark">Oops! Something went wrong.</h2>
              <p className="text-muted mb-4 text-center">
                We're sorry, but an unexpected error occurred. Please try reloading the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-start bg-light p-3 rounded border overflow-auto mb-4" style={{ maxHeight: '200px' }}>
                  <code className="text-danger small">{this.state.error.toString()}</code>
                  <br />
                  <code className="text-muted small" style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo?.componentStack}
                  </code>
                </div>
              )}

              <Button 
                variant="primary" 
                size="lg" 
                onClick={this.handleReload}
                className="px-5 rounded-pill shadow-sm gradient-button-premium"
              >
                Reload Application
              </Button>
            </Card>
          </Container>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
