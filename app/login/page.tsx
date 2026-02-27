'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { loginUser } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    
    startTransition(async () => {
      const result = await loginUser(formData)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-1">Lumosity Leaderboard</h1>
          <p className="text-blue-100 text-sm">Compete with friends, track your progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">Sign in to continue</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Username</label>
              <input
                type="text"
                name="email"
                placeholder="you@example.com or username"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
                disabled={isPending}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
                disabled={isPending}
              />
              <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm mb-4">Don't have an account?</div>
            <Link
              href="/register"
              className="w-full border-2 border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors block text-center"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-white text-sm font-semibold">Track Scores</div>
          </div>
          <div>
            <div className="text-2xl mb-1">👥</div>
            <div className="text-white text-sm font-semibold">Compete</div>
          </div>
          <div>
            <div className="text-2xl mb-1">📊</div>
            <div className="text-white text-sm font-semibold">Leaderboards</div>
          </div>
        </div>
      </div>
    </div>
  )
}
