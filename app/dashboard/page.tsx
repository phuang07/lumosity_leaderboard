import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import ScoreEntryForm from '@/components/ScoreEntryForm'
import UserChampionsSummary from '@/components/UserChampionsSummary'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions/auth'

export default async function DashboardPage() {
  // Get the logged-in user
  const user = await getCurrentUser()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch games for the score entry form
  const games = await prisma.game.findMany({
    orderBy: { name: 'asc' },
  })

  // Fetch user's stats
  const userStats = await prisma.userStats.findUnique({
    where: { userId: user.id }
  })

  // Fetch user's scores count
  const scoresCount = await prisma.score.count({
    where: { userId: user.id }
  })

  // Fetch user's achievements
  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id }
  })

  // Fetch friends count
  const friendsCount = await prisma.friendship.count({
    where: {
      OR: [
        { userId: user.id, status: 'ACCEPTED' },
        { friendId: user.id, status: 'ACCEPTED' }
      ]
    }
  })

  // Calculate global rank (simplified - count users with more games played)
  const usersWithMoreGames = await prisma.userStats.count({
    where: {
      totalGamesPlayed: {
        gt: userStats?.totalGamesPlayed || 0
      }
    }
  })
  const globalRank = usersWithMoreGames + 1

  // Calculate streak (simplified - just show days since account created for now)
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const streak = Math.min(daysSinceCreated + 1, 7) // Cap at 7 for demo

  const stats = {
    rank: globalRank,
    gamesCompleted: userStats?.totalGamesPlayed || 0,
    streak: streak,
    friends: friendsCount,
  }

  // Map achievement types for display
  const achievementDisplay = [
    { icon: '🏆', name: 'First Score', type: 'FIRST_SCORE' },
    { icon: '⭐', name: '5 Games', type: 'FIVE_GAMES' },
    { icon: '🔥', name: '7 Day Streak', type: 'STREAK_MASTER' },
    { icon: '👑', name: 'Top 10', type: 'TOP_10' },
    { icon: '💎', name: '10 Games', type: 'TEN_GAMES' },
    { icon: '🎯', name: 'Perfect Score', type: 'PERFECTIONIST' },
  ].map(a => ({
    ...a,
    unlocked: achievements.some(ua => ua.type === a.type)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={user.username} role={user.role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard value={`#${stats.rank}`} label="Global Rank" change={stats.rank <= 10 ? "🔥 Top 10!" : "Keep playing!"} />
          <StatCard value={stats.gamesCompleted} label="Games Completed" change={stats.gamesCompleted > 0 ? `${scoresCount} scores recorded` : "Submit your first score!"} borderColor="border-secondary" />
          <StatCard value={stats.streak} label="Day Streak" change={stats.streak >= 7 ? "🔥 Keep it up!" : `${7 - stats.streak} days to 7-day streak`} borderColor="border-success" />
          <StatCard value={stats.friends} label="Friends" change={stats.friends > 0 ? `${stats.friends} connected` : "Add some friends!"} borderColor="border-warning" />
        </div>

        {/* Quick Actions & Score Entry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScoreEntryForm games={games} userId={user.id} />
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Games Completed</span>
                  <span className="font-semibold">{stats.gamesCompleted} / {games.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min((stats.gamesCompleted / games.length) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">This Week's Goal</span>
                  <span className="font-semibold">{Math.min(scoresCount, 5)} / 5 games</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min((scoresCount / 5) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Achievements Unlocked</span>
                  <span className="font-semibold">{achievements.length} / {achievementDisplay.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(achievements.length / achievementDisplay.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Achievements</h2>
            <span className="text-gray-500 text-sm">
              {achievements.length} / {achievementDisplay.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {achievementDisplay.map((achievement, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl text-center border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-success bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-xs text-gray-600">{achievement.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Champions Summary */}
        <div className="mb-8">
          <UserChampionsSummary />
        </div>

        {/* Welcome Message for New Users */}
        {stats.gamesCompleted === 0 && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 shadow-sm text-white">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.username}! 👋</h2>
            <p className="opacity-90">
              Get started by submitting your first Lumosity score above. Track your progress, 
              compete with friends, and climb the leaderboards!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
