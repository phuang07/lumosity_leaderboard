'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserChampion {
  userId: string
  username: string
  avatarUrl: string | null
  gamesLed: number
  leadingGames: string[]
}

export default function UserChampionsSummary() {
  const [champions, setChampions] = useState<UserChampion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserChampions()
  }, [])

  const fetchUserChampions = async () => {
    try {
      const response = await fetch('/api/leaderboard?userChampions=true')
      const data = await response.json()
      setChampions(data)
    } catch (error) {
      console.error('Error fetching user champions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🏆</span> User Champions Summary
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">Loading champions...</div>
      </div>
    )
  }

  if (champions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🏆</span> User Champions Summary
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          No champions yet. Be the first to top a game!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>🏆</span> User Champions Summary
        </h2>
        <Link
          href="/leaderboard"
          className="text-primary text-sm hover:underline"
        >
          View Leaderboard
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Games Won
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Leading Games
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {champions.map((champion, index) => (
              <tr
                key={champion.userId}
                className={`hover:bg-gray-50 ${index === 0 ? 'bg-blue-50/50' : ''}`}
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
                      {getInitials(champion.username)}
                    </div>
                    <div>
                      <div className="font-semibold">{champion.username}</div>
                      <div className="text-xs text-gray-500">
                        @{champion.username.toLowerCase().replace(/\s+/g, '')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold">{champion.gamesLed}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {champion.leadingGames.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
