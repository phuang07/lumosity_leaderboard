import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'global'
    const userId = searchParams.get('userId')
    const gameId = searchParams.get('gameId')
    const gameName = searchParams.get('gameName')
    const champions = searchParams.get('champions') === 'true'
    const userChampions = searchParams.get('userChampions') === 'true'

    // Handle user champions endpoint - aggregates champions by user
    if (userChampions) {
      const games = await prisma.game.findMany({
        include: {
          scores: {
            orderBy: { score: 'desc' },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      // Aggregate by user
      const userChampionsMap = new Map<string, {
        userId: string
        username: string
        avatarUrl: string | null
        gamesLed: number
        leadingGames: string[]
      }>()

      games.forEach((game) => {
        if (game.scores.length > 0) {
          const topScore = game.scores[0]
          const userId = topScore.user.id

          if (userChampionsMap.has(userId)) {
            const existing = userChampionsMap.get(userId)!
            existing.gamesLed += 1
            existing.leadingGames.push(game.name)
          } else {
            userChampionsMap.set(userId, {
              userId: topScore.user.id,
              username: topScore.user.username,
              avatarUrl: topScore.user.avatarUrl,
              gamesLed: 1,
              leadingGames: [game.name],
            })
          }
        }
      })

      // Convert to array and sort by games led (descending)
      const userChampionsList = Array.from(userChampionsMap.values())
        .sort((a, b) => b.gamesLed - a.gamesLed)

      return NextResponse.json(userChampionsList)
    }

    // Handle champions endpoint
    if (champions) {
      const games = await prisma.game.findMany({
        include: {
          scores: {
            orderBy: { score: 'desc' },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      const gameChampions = games
        .filter((game) => game.scores.length > 0)
        .map((game) => {
          const topScore = game.scores[0]
          return {
            gameId: game.id,
            gameName: game.name,
            gameCategory: game.category,
            topPlayer: {
              userId: topScore.user.id,
              username: topScore.user.username,
              avatarUrl: topScore.user.avatarUrl,
              score: topScore.score,
            },
          }
        })

      return NextResponse.json(gameChampions)
    }

    // Handle game-specific leaderboard
    if (gameId || gameName) {
      let game
      if (gameId) {
        game = await prisma.game.findUnique({
          where: { id: gameId },
        })
      } else if (gameName) {
        game = await prisma.game.findUnique({
          where: { name: gameName },
        })
      }

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      let userFilter: { userId?: { in: string[] } } = {}

      if (type === 'friends' && userId) {
        const friendships = await prisma.friendship.findMany({
          where: {
            OR: [
              { userId, status: 'ACCEPTED' },
              { friendId: userId, status: 'ACCEPTED' },
            ],
          },
        })

        const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId))
        friendIds.push(userId)
        userFilter = { userId: { in: friendIds } }
      }

      const scores = await prisma.score.findMany({
        where: {
          gameId: game.id,
          ...userFilter,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { score: 'desc' },
      })

      const leaderboard = await Promise.all(
        scores.map(async (score) => {
          // Get total game count for this user
          const gameCountResult = await prisma.score.groupBy({
            by: ['userId'],
            where: { userId: score.userId },
            _count: { gameId: true },
          })

          return {
            userId: score.user.id,
            username: score.user.username,
            avatarUrl: score.user.avatarUrl,
            gameCount: gameCountResult[0]?._count.gameId || 0,
            totalScore: score.score, // This is the game-specific score
            gameScore: score.score,
            bestGame: game.name,
          }
        })
      )

      return NextResponse.json(leaderboard)
    }

    // Original logic for all games leaderboard
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
