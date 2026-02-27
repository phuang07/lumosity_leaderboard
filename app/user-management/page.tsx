import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import UserManagementPanel from '@/components/UserManagementPanel'
import { getCurrentUser } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'

export default async function UserManagementPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  const users = currentUser.role === 'ADMIN'
    ? await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
        orderBy: {
          username: 'asc',
        },
      })
    : [
        {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
        },
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={currentUser.username} role={currentUser.role} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserManagementPanel currentUser={currentUser} users={users} />
      </main>
    </div>
  )
}
