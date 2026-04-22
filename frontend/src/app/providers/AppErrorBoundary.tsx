import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  message: string
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected application error',
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App render failed:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-screen grid place-items-center bg-[#f4f0e8] px-6">
        <section className="max-w-[560px] w-full rounded-[12px] border border-[#d8ceb8] bg-[#fdfaf4] p-8 text-[#2c2418]">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a8f7a] mb-3">
            Startup issue
          </p>
          <h1 className="font-serif text-4xl mb-3">The app hit an error while loading.</h1>
          <p className="text-sm leading-6 text-[#6b6253] mb-5">
            We caught the error so the screen does not stay blank. Open the browser console to
            see the technical details, then refresh after the fix.
          </p>
          <pre className="overflow-auto rounded-[8px] border border-[#d8ceb8] bg-white/70 px-4 py-3 font-mono text-xs text-[#1a3a2a]">
            {this.state.message}
          </pre>
        </section>
      </div>
    )
  }
}

export default AppErrorBoundary
