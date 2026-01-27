import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import ScoreEntryForm from '@/components/ScoreEntryForm'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'

export default async function ScoreEntryPage() {
  // Get the logged-in user
  const user = await getCurrentUser()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  const games = await prisma.game.findMany({
    orderBy: { name: 'asc' },
  })

  // Fetch user's recent scores
  const recentScores = await prisma.score.findMany({
    where: { userId: user.id },
    include: { game: true },
    orderBy: { achievedAt: 'desc' },
    take: 5,
  })

  // Group games by category
  const gamesByCategory = games.reduce((acc, game) => {
    if (!acc[game.category]) {
      acc[game.category] = []
    }
    acc[game.category].push(game)
    return acc
  }, {} as Record<string, typeof games>)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={user.username} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Submit Your Score</h1>
          <ScoreEntryForm games={games} userId={user.id} />
        </div>

        {/* Recent Scores */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Recent Scores</h2>
          </div>
          {recentScores.length > 0 ? (
            <div className="space-y-4">
              {recentScores.map((score) => {
                const timeAgo = getTimeAgo(score.achievedAt)
                return (
                  <div key={score.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{score.game.name}</div>
                      <div className="text-sm text-gray-600">{timeAgo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{score.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Personal Best</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No scores yet. Submit your first score above!</p>
            </div>
          )}
        </div>

        {/* Game Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Explore Games by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '🎯', name: 'Attention', count: 12 },
              { icon: '🧠', name: 'Memory', count: 10 },
              { icon: '🔄', name: 'Flexibility', count: 8 },
              { icon: '⚡', name: 'Speed', count: 10 },
              { icon: '🧩', name: 'Problem Solving', count: 10 },
            ].map((category, idx) => (
              <div
                key={idx}
                className="p-6 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-semibold mb-1">{category.name}</div>
                <div className="text-xs text-gray-600">{category.count} games</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
}
