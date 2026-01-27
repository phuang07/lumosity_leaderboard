import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    const userId = searchParams.get('userId')

    if (type === 'friends' && userId) {
      // Get user's friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId, status: 'ACCEPTED' },
            { friendId: userId, status: 'ACCEPTED' },
          ],
        },
      })

      const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId))
      friendIds.push(userId) // Include current user

      const scores = await prisma.score.groupBy({
        by: ['userId'],
        where: {
          userId: { in: friendIds },
        },
        _count: { gameId: true },
        _sum: { score: true },
      })

      const leaderboard = await Promise.all(
        scores.map(async (score) => {
          const user = await prisma.user.findUnique({
            where: { id: score.userId },
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          })

          const bestGame = await prisma.score.findFirst({
            where: { userId: score.userId },
            orderBy: { score: 'desc' },
            include: { game: true },
          })

          return {
            userId: score.userId,
            username: user?.username || 'Unknown',
            avatarUrl: user?.avatarUrl,
            gameCount: score._count.gameId,
            totalScore: Number(score._sum.score || 0),
            bestGame: bestGame?.game.name || null,
          }
        })
      )

      leaderboard.sort((a, b) => b.gameCount - a.gameCount)

      return NextResponse.json(leaderboard)
    } else {
      // Global leaderboard
      const scores = await prisma.score.groupBy({
        by: ['userId'],
        _count: { gameId: true },
        _sum: { score: true },
      })

      const leaderboard = await Promise.all(
        scores.map(async (score) => {
          const user = await prisma.user.findUnique({
            where: { id: score.userId },
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          })

          const bestGame = await prisma.score.findFirst({
            where: { userId: score.userId },
            orderBy: { score: 'desc' },
            include: { game: true },
          })

          return {
            userId: score.userId,
            username: user?.username || 'Unknown',
            avatarUrl: user?.avatarUrl,
            gameCount: score._count.gameId,
            totalScore: Number(score._sum.score || 0),
            bestGame: bestGame?.game.name || null,
          }
        })
      )

      leaderboard.sort((a, b) => b.gameCount - a.gameCount)

      return NextResponse.json(leaderboard)
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
