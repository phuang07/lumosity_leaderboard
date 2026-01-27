'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  gameCount: number
  totalScore: number
  bestGame: string | null
}

export default function LeaderboardPage() {
  const [type, setType] = useState<'global' | 'friends'>('global')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [type])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?type=${type}`)
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username="John Doe" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-200 mb-6">
            <button
              onClick={() => setType('global')}
              className={`px-6 py-3 font-medium transition-colors ${
                type === 'global'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setType('friends')}
              className={`px-6 py-3 font-medium transition-colors ${
                type === 'friends'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Friends
            </button>
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Games
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Best Game
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-gray-50 ${
                        entry.userId === 'mock-user-id' ? 'bg-blue-50 border-2 border-primary' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`text-xl font-bold ${
                            index === 0
                              ? 'text-primary'
                              : index < 3
                              ? 'text-warning'
                              : 'text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                            {entry.username
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {entry.username}
                              {entry.userId === 'mock-user-id' && (
                                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">@{entry.username.toLowerCase().replace(' ', '')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold">{entry.gameCount}</td>
                      <td className="px-4 py-4">{entry.totalScore.toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-600">{entry.bestGame || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors">
              Previous
            </button>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    page === 1
                      ? 'bg-primary text-white'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
