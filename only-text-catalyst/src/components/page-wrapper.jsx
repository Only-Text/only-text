export function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-orange-500/10 blur-3xl dark:from-purple-500/5 dark:to-orange-500/5" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 blur-3xl dark:from-orange-500/5 dark:to-pink-500/5" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl dark:from-pink-500/5 dark:to-purple-500/5" />
      </div>
      
      {children}
    </div>
  )
}
