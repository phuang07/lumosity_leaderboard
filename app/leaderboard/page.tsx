'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import gamesData from '@/data/games.json'

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  gameCount: number
  totalScore: number
  bestGame: string | null
  gameScore?: number
}

interface GameChampion {
  gameId: string
  gameName: string
  gameCategory: string
  topPlayer: {
    userId: string
    username: string
    avatarUrl: string | null
    score: number
  }
}

interface Game {
  id?: string
  name: string
  category: string
}

export default function LeaderboardPage() {
  const [type, setType] = useState<'global' | 'friends'>('global')
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [champions, setChampions] = useState<GameChampion[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [championsLoading, setChampionsLoading] = useState(true)

  useEffect(() => {
    // Load games from JSON
    setGames(gamesData.games.map((g) => ({ name: g.name, category: g.category })))
    fetchChampions()
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [type, selectedGame])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      let url = `/api/leaderboard?type=${type}`
      if (selectedGame !== 'all') {
        // Find game ID by name
        const game = gamesData.games.find((g) => g.name === selectedGame)
        if (game) {
          // We need to get the game ID from the database
          // For now, we'll use the game name and let the API handle it
          // We need to fetch games with IDs first, or modify API to accept game name
          // For simplicity, let's modify the API to accept gameName
          url += `&gameName=${encodeURIComponent(selectedGame)}`
        }
      }
      const response = await fetch(url)
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChampions = async () => {
    setChampionsLoading(true)
    try {
      const response = await fetch('/api/leaderboard?champions=true')
      const data = await response.json()
      setChampions(data)
    } catch (error) {
      console.error('Error fetching champions:', error)
    } finally {
      setChampionsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username="John Doe" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                style={{ width: '200px' }}
              />
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                style={{ width: '200px' }}
              >
                <option value="all">All Games</option>
                {gamesData.games.map((game) => (
                  <option key={game.name} value={game.name}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                      {selectedGame === 'all' ? 'Total Score' : 'Score'}
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
                      <td className="px-4 py-4">
                        {selectedGame === 'all'
                          ? entry.totalScore.toLocaleString()
                          : (entry.gameScore || entry.totalScore).toLocaleString()}
                      </td>
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

        {/* Game Champions Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Game Champions
          </h2>
          {championsLoading ? (
            <div className="text-center py-12">Loading champions...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {champions.map((champion) => (
                <div
                  key={champion.gameId}
                  className="border-2 border-primary rounded-xl p-4 bg-gradient-to-br from-blue-50 to-purple-50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🥇</span>
                    <div>
                      <div className="font-semibold text-lg">{champion.gameName}</div>
                      <div className="text-xs text-gray-500">{champion.gameCategory}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
                      {champion.topPlayer.username
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{champion.topPlayer.username}</div>
                      <div className="text-xs text-gray-500">@{champion.topPlayer.username.toLowerCase().replace(' ', '')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{champion.topPlayer.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
