export function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-chile-bg-primary">
      {/* Header skeleton */}
      <header className="px-4 py-3 border-b border-chile-bg-secondary">
        <div className="animate-pulse">
          <div className="h-6 w-64 bg-chile-bg-card rounded mb-2" />
          <div className="h-4 w-48 bg-chile-bg-card rounded" />
        </div>
      </header>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Map skeleton */}
        <div className="flex-1 bg-chile-bg-secondary animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-chile-bg-card animate-spin-slow" style={{
              background: 'conic-gradient(from 0deg, transparent, #e63946)'
            }} />
            <p className="text-chile-text-secondary">Loading map...</p>
          </div>
        </div>
        
        {/* Panel skeleton */}
        <div className="w-full md:w-96 border-l border-chile-bg-secondary">
          {/* Timeline skeleton */}
          <div className="p-4 border-b border-chile-bg-secondary">
            <div className="animate-pulse">
              <div className="h-5 w-32 bg-chile-bg-card rounded mb-3" />
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex-shrink-0 w-28 h-16 bg-chile-bg-card rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Location panel skeleton */}
          <div className="p-4 animate-pulse">
            <div className="h-6 w-40 bg-chile-bg-card rounded mb-2" />
            <div className="h-4 w-32 bg-chile-bg-card rounded mb-4" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-20 bg-chile-bg-card rounded-lg" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-chile-bg-card rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MapLoading() {
  return (
    <div className="absolute inset-0 bg-chile-bg-primary flex items-center justify-center z-[1000]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-chile-bg-card" />
          <div className="absolute inset-0 rounded-full border-4 border-t-chile-accent-red animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-chile-bg-card" />
          <div className="absolute inset-2 rounded-full border-4 border-t-chile-accent-teal animate-spin-reverse" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🇨🇱</div>
        </div>
        <p className="text-chile-text-secondary font-medium">Loading Chile Map...</p>
        <p className="text-chile-text-muted text-sm mt-1">97 recommendations across 12 destinations</p>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center bg-chile-bg-primary">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🌋</div>
        <h2 className="text-xl font-bold text-chile-text-primary mb-2">Something went wrong</h2>
        <p className="text-chile-text-secondary mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-chile-accent-red rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
