import { Component, ReactNode } from "react";

// Catches crashes, including a lazy page whose file is gone after a redeploy
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;

        return (
            <main className="main-container">
                <div className="empty-state">
                    <h1 className="empty-title">Something went wrong</h1>
                    <p className="empty-text">Reloading usually fixes it.</p>
                    <button className="btn-secondary" onClick={() => window.location.reload()}>Reload</button>
                </div>
            </main>
        );
    }
}

export default ErrorBoundary;
