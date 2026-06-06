import { Component, ReactNode, ErrorInfo } from "react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Reni] Page error on ${this.props.pageName ?? "unknown"}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#FAFAF7" }}
        >
          <div className="container max-w-lg text-center py-24">
            <div
              className="w-12 h-px mx-auto mb-8"
              style={{ background: "rgba(45,44,44,0.2)" }}
            />
            <p
              className="text-xs tracking-widest uppercase font-medium mb-4"
              style={{ color: "rgba(45,44,44,0.4)" }}
            >
              Something went wrong
            </p>
            <h2
              className="font-display text-3xl font-light mb-4"
              style={{ color: "#2D2C2C" }}
            >
              This page encountered an error.
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: "rgba(45,44,44,0.5)" }}
            >
              We apologise for the interruption. The issue has been logged. Please
              return to the homepage or try refreshing.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/" className="btn-reni-dark">
                Return Home
              </Link>
              <button
                className="btn-reni-outline"
                onClick={() => this.setState({ hasError: false, errorMessage: "" })}
              >
                Try Again
              </button>
            </div>
            {import.meta.env.DEV && (
              <pre
                className="mt-8 text-left text-[10px] p-4 overflow-auto"
                style={{ background: "#EAEADF", color: "rgba(45,44,44,0.6)", maxHeight: 160 }}
              >
                {this.state.errorMessage}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
