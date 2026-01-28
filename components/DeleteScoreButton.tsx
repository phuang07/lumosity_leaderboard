'use client'

import { useState } from 'react'
import { deleteScore } from '@/app/actions/scores'
import { useRouter } from 'next/navigation'

interface DeleteScoreButtonProps {
  scoreId: string
  userId: string
  gameName?: string
}

export default function DeleteScoreButton({ scoreId, userId, gameName }: DeleteScoreButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      gameName
        ? `Are you sure you want to delete your score for ${gameName}? This action cannot be undone.`
        : 'Are you sure you want to delete this score? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await deleteScore(userId, scoreId)

      if (result.success) {
        // Refresh the page to show updated scores
        router.refresh()
      } else {
        setError(result.message || 'Failed to delete score')
      }
    } catch (err) {
      setError('An error occurred while deleting the score')
      console.error('Error deleting score:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete score"
        aria-label="Delete score"
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 text-red-800 text-xs rounded shadow-lg z-10 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
