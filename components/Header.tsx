import Link from 'next/link'
import UserMenu from './UserMenu'

type HeaderProps = {
  username?: string
  role?: 'ADMIN' | 'MEMBER'
}

export default function Header({ username = 'User', role = 'MEMBER' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🧠 Lumosity Leaderboard
          </Link>
          <div className="hidden md:flex gap-6 lg:gap-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-primary font-medium transition-colors">
              Leaderboard
            </Link>
            <Link href="/score-entry" className="text-gray-600 hover:text-primary font-medium transition-colors">
              Add Score
            </Link>
            <Link href="/friends/compare" className="text-gray-600 hover:text-primary font-medium transition-colors">
              Compare
            </Link>
            <Link href="/user-management" className="text-gray-600 hover:text-primary font-medium transition-colors">
              {role === 'ADMIN' ? 'Manage Users' : 'Profile'}
            </Link>
          </div>
          <UserMenu username={username} role={role} />
        </nav>
      </div>
    </header>
  )
}
