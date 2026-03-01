'use client'

import { useState } from 'react'
import { submitScore } from '@/app/actions/scores'

interface Game {
  id: string
  name: string
  category: string
}

interface ScoreEntryFormProps {
  games: Game[]
  userId: string
}

// Message variations when user dethrones the previous leader
const DETHRONE_MESSAGES = [
  (game: string, prev: string) =>
    `🎉 BOOM! You just dethroned ${prev} in ${game}! The crown is yours, champion—don't let it go to your head (too much).`,
  (game: string, prev: string) =>
    `${prev} never saw it coming! You've snagged the lead in ${game} like a brain-training ninja. Keep that momentum going!`,
  (game: string, prev: string) =>
    `🏆 Lead status: SNAPPED. ${prev} is now in your rearview mirror in ${game}. Time to defend that throne!`,
  (game: string, prev: string) =>
    `Mission accomplished! You've officially stolen the spotlight from ${prev} in ${game}. They'll be seeing your name in their dreams now.`,
  (game: string, prev: string) =>
    `${prev} who? Just kidding—you just crushed their record in ${game}! The leaderboard is yours. Own it!`,
  (game: string, prev: string) =>
    `Out with the old, in with the YOU! ${prev} has been demoted in ${game}. Enjoy the view from the top! 🚀`,
  (game: string, prev: string) =>
    `Another one bites the dust! ${prev} has been toppled by your mighty score in ${game}. Keep climbing—the sky's the limit!`,
]

// Message variations when user is first to conquer the game
const FIRST_LEADER_MESSAGES = [
  (game: string) =>
    `🌟 Pioneer alert! You're the first to conquer ${game}! The throne was empty—and now it's yours. Set the bar high!`,
  (game: string) =>
    `🚀 History in the making! You've claimed ${game} as your kingdom. No one else has dared—you're the trailblazer!`,
  (game: string) =>
    `👑 First blood! You've planted your flag in ${game}. Everyone else is playing catch-up now. Own it!`,
  (game: string) =>
    `⚡ Ground zero! You're the inaugural champion of ${game}. The leaderboard is your canvas—paint it proud!`,
  (game: string) =>
    `🎯 Bullseye! Nobody's topped ${game} yet—until you. You've set the standard. Now defend it!`,
  (game: string) =>
    `✨ The throne was waiting! You're the first ruler of ${game}. May your reign be long and your scores stay high!`,
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function ScoreEntryForm({ games, userId }: ScoreEntryFormProps) {
  const [selectedGame, setSelectedGame] = useState('')
  const [score, setScore] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await submitScore(userId, {
        gameId: selectedGame,
        score: parseInt(score),
      })

      if (result.success) {
        let displayMessage = result.message || 'Score submitted successfully!'

        if (result.newLeader && result.gameName) {
          if (result.isFirstLeader) {
            displayMessage = pickRandom(FIRST_LEADER_MESSAGES)(result.gameName)
          } else if (result.previousLeader) {
            displayMessage = pickRandom(DETHRONE_MESSAGES)(result.gameName, result.previousLeader)
          }
        }

        setMessage({ type: 'success', text: displayMessage })
        setScore('')
        setSelectedGame('')
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to submit score' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add New Score</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
          >
            <option value="">Select a game...</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter your score"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
            min="1"
          />
        </div>
        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Score'}
        </button>
      </form>
    </div>
  )
}
