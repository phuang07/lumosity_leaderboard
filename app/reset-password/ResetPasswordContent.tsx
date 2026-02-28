'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { resetPassword } from '@/app/actions/auth'

export function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const data = new FormData()
    data.set('token', token)
    data.set('password', formData.get('password') as string)

    startTransition(async () => {
      const result = await resetPassword(data)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setError(result.error || 'Something went wrong')
      }
    })
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Invalid reset link</h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors block text-center"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">🧠</div>
            <h1 className="text-3xl font-bold text-white mb-1">Lumosity Leaderboard</h1>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Password reset</h2>
              <p className="text-gray-600 text-sm">
                Your password has been updated. Redirecting you to sign in...
              </p>
            </div>
            <Link
              href="/login"
              className="w-full border-2 border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors block text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-1">Lumosity Leaderboard</h1>
          <p className="text-blue-100 text-sm">Set a new password</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Reset password</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
                minLength={6}
                disabled={isPending}
                autoComplete="new-password"
              />
              <div className="text-xs text-gray-500 mt-1">Must be at least 6 characters</div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="w-full text-center text-primary text-sm font-medium hover:underline block"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
