import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-1">Lumosity Leaderboard</h1>
          <p className="text-blue-100 text-sm">Compete with friends, track your progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome</h2>
          <p className="text-gray-600 text-center mb-6 text-sm">Sign in to continue</p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors block text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full border-2 border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors block text-center"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary">
              Or continue as guest →
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm mb-4">Or continue with</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="border-2 border-gray-300 py-2 px-4 rounded-lg font-medium hover:border-primary transition-colors">
                Google
              </button>
              <button className="border-2 border-gray-300 py-2 px-4 rounded-lg font-medium hover:border-primary transition-colors">
                Facebook
              </button>
            </div>
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
  );
}
