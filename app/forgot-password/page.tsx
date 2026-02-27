'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    setResetLink(null)

    startTransition(async () => {
      const result = await requestPasswordReset(formData)

      if (result.success) {
        setSuccess(true)
        if (result.resetLink) {
          setResetLink(result.resetLink)
        }
      } else {
        setError(result.error || 'Something went wrong')
      }
    })
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
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-gray-600 text-sm">
                If an account exists with that email, we&apos;ve sent you a password reset link.
              </p>
            </div>

            {resetLink && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm font-medium mb-2">Development mode</p>
                <p className="text-amber-700 text-xs mb-2">
                  No email service configured. Use this link to reset your password:
                </p>
                <Link
                  href={resetLink}
                  className="text-primary text-sm font-semibold hover:underline break-all"
                >
                  {resetLink}
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="w-full border-2 border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors block text-center"
            >
              Back to Sign In
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
          <p className="text-blue-100 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Forgot password?</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Sending...' : 'Send reset link'}
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
