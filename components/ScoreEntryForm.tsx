'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [selectedGameName, setSelectedGameName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayValue = selectedGame ? selectedGameName : searchQuery

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedGame('')
    setSelectedGameName('')
    setIsOpen(true)
    setHighlightedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (!selectedGame) {
      setSearchQuery('')
    }
  }

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game.id)
    setSelectedGameName(game.name)
    setSearchQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredGames.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredGames.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredGames[highlightedIndex]) {
          handleSelectGame(filteredGames[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

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
        setSelectedGameName('')
        setSearchQuery('')
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
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Type to search games..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            required
            autoComplete="off"
            data-cy="game-search-input"
          />
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredGames.length > 0 ? (
                filteredGames.map((game, index) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    data-cy="game-option"
                    data-cy-game-id={game.id}
                    data-cy-game-name={game.name}
                    className={`w-full px-4 py-2.5 text-left flex justify-between items-center transition-colors ${
                      index === highlightedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{game.name}</span>
                    <span className="text-sm text-gray-500">{game.category}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No games found. Try a different search.
                </div>
              )}
            </div>
          )}
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
            data-cy={message.type === 'success' ? 'score-success-message' : 'score-error-message'}
            className={`p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !selectedGame}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Score'}
        </button>
      </form>
    </div>
  )
}
