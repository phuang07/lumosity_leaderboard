'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

const MOCK_USER_ID = 'mock-user-id'

export default function FriendComparePage() {
  const [selectedFriend, setSelectedFriend] = useState('')
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!selectedFriend) return
    setLoading(true)
    try {
      const response = await fetch(`/api/friends/compare?userId=${MOCK_USER_ID}&friendId=${selectedFriend}`)
      const result = await response.json()
      setComparison(result)
    } catch (error) {
      console.error('Error comparing:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username="John Doe" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Compare Scores</h1>
          <div className="flex gap-4">
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="">Choose a friend...</option>
              <option value="friend-1">Sarah Miller</option>
              <option value="friend-2">Mike Johnson</option>
              <option value="friend-3">Emma Wilson</option>
            </select>
            <button
              onClick={handleCompare}
              disabled={!selectedFriend || loading}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Compare
            </button>
          </div>
        </div>

        {comparison && (
          <>
            {/* Overall Comparison */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Overall Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <div className="font-semibold mb-1">You</div>
                      <div className="text-sm text-gray-600">John Doe</div>
                    </div>
                    <div className="text-4xl font-bold">{comparison.userGamesCount}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Games Completed</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(comparison.userGamesCount / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <div className="font-semibold mb-1">Friend</div>
                      <div className="text-sm text-gray-600">@{selectedFriend}</div>
                    </div>
                    <div className="text-4xl font-bold text-danger">{comparison.friendGamesCount}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Games Completed</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(comparison.friendGamesCount / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <div className="font-semibold mb-2">Head-to-Head Record</div>
                <div className="text-2xl">
                  <span className="text-danger">{comparison.record.losses}</span> -{' '}
                  <span className="text-success">{comparison.record.wins}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {comparison.record.losses > comparison.record.wins
                    ? "You're behind. Keep playing!"
                    : "You're ahead! Great job!"}
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
                      <div className="text-xs text-gray-600">You</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${comp.friendScore ? 'text-danger' : 'text-gray-400'}`}>
                        {comp.friendScore?.toLocaleString() || '-'}
                      </div>
                      <div className="text-xs text-gray-600">Friend</div>
                    </div>
                    <div className="text-center">
                      {comp.result === 'win' && (
                        <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
                          Win
                        </span>
                      )}
                      {comp.result === 'loss' && (
                        <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-xs font-semibold">
                          Loss
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
