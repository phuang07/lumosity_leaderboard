'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface User {
  id: string
  username: string
  avatarUrl: string | null
}

export default function FriendComparePage() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUsername, setCurrentUsername] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)

  const player1 = users.find(u => u.id === player1Id)
  const player2 = users.find(u => u.id === player2Id)

  useEffect(() => {
    // Get current user
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current')
        if (response.ok) {
          const user = await response.json()
          if (user) {
            setCurrentUserId(user.id)
            setCurrentUsername(user.username)
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }

    // Fetch all users
    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const allUsers = await response.json()
          setUsers(allUsers)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setUsersLoading(false)
      }
    }

    fetchCurrentUser()
    fetchUsers()
  }, [])

  // Pre-select current user in player 1 when they log in (only if not already set)
  useEffect(() => {
    if (currentUserId && users.length > 0 && !player1Id) {
      setPlayer1Id(currentUserId)
    }
  }, [currentUserId, users, player1Id])

  const handleCompare = async () => {
    if (!player1Id || !player2Id || player1Id === player2Id) return
    setLoading(true)
    try {
      const response = await fetch(`/api/friends/compare?userId=${player1Id}&friendId=${player2Id}`)
      const result = await response.json()
      setComparison(result)
    } catch (error) {
      console.error('Error comparing:', error)
    } finally {
      setLoading(false)
    }
  }

  const canCompare = player1Id && player2Id && player1Id !== player2Id

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={currentUsername || 'User'} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Compare Scores</h1>
          <p className="text-gray-600 mb-4">Select any two players to compare their scores.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              disabled={usersLoading}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Select player 1...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} disabled={user.id === player2Id}>
                  {user.username}{user.id === currentUserId ? ' (you)' : ''}
                </option>
              ))}
            </select>
            <span className="hidden sm:inline self-center text-gray-400 font-medium">vs</span>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              disabled={usersLoading}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Select player 2...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id} disabled={user.id === player1Id}>
                  {user.username}{user.id === currentUserId ? ' (you)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={!canCompare || loading}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
            >
              Compare
            </button>
          </div>
        </div>

        {comparison && player1 && player2 && (
          <>
            {/* Overall Comparison */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Overall Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <div className="font-semibold mb-1">
                        {player1.username}
                        {player1.id === currentUserId && (
                          <span className="ml-2 text-sm font-normal text-gray-500">(you)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-4xl font-bold">{comparison.userGamesCount}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Games Completed</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(comparison.userGamesCount / (comparison.totalGamesCount || 50)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <div className="font-semibold mb-1">
                        {player2.username}
                        {player2.id === currentUserId && (
                          <span className="ml-2 text-sm font-normal text-gray-500">(you)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-danger">{comparison.friendGamesCount}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Games Completed</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(comparison.friendGamesCount / (comparison.totalGamesCount || 50)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <div className="font-semibold mb-2">Head-to-Head Record</div>
                <div className="text-2xl">
                  <span className="text-success">{player1.username} wins: {comparison.record.wins}</span>
                  <span className="mx-2">|</span>
                  <span className="text-danger">{player2.username} wins: {comparison.record.losses}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {comparison.record.wins > comparison.record.losses
                    ? `${player1.username} is ahead!`
                    : comparison.record.losses > comparison.record.wins
                    ? `${player2.username} is ahead!`
                    : "It's a tie!"}
                </div>
              </div>
            </div>

            {/* Game-by-Game Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Game-by-Game Breakdown</h2>
              <div className="space-y-4">
                {comparison.comparisons.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg items-center"
                  >
                    <div className="font-semibold">{comp.gameName}</div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${comp.userScore ? 'text-success' : 'text-gray-400'}`}>
                        {comp.userScore?.toLocaleString() || '-'}
                      </div>
                      <div className="text-xs text-gray-600">{player1.username}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${comp.friendScore ? 'text-danger' : 'text-gray-400'}`}>
                        {comp.friendScore?.toLocaleString() || '-'}
                      </div>
                      <div className="text-xs text-gray-600">{player2.username}</div>
                    </div>
                    <div className="text-center">
                      {comp.result === 'win' && (
                        <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
                          {player1.username} wins
                        </span>
                      )}
                      {comp.result === 'loss' && (
                        <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-xs font-semibold">
                          {player2.username} wins
                        </span>
                      )}
                      {comp.result === 'tie' && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                          Tie
                        </span>
                      )}
                      {comp.result === 'not_played' && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          Not Played
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
