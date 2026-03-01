'use server'

import { prisma } from '@/lib/prisma'
import { scoreSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function submitScore(userId: string, data: { gameId: string; score: number; achievedAt?: Date }) {
  try {
    const validated = scoreSchema.parse({
      gameId: data.gameId,
      score: data.score,
      achievedAt: data.achievedAt,
    })

    // Check if user already has a score for this game
    const existingScore = await prisma.score.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: validated.gameId,
        },
      },
    })

    // Only update if new score is higher
    if (existingScore && existingScore.score >= validated.score) {
      return { success: false, message: 'New score must be higher than existing score' }
    }

    // Check if user will become new leader (before upsert)
    const game = await prisma.game.findUnique({
      where: { id: validated.gameId },
      select: { name: true },
    })
    const topScore = await prisma.score.findFirst({
      where: { gameId: validated.gameId },
      orderBy: { score: 'desc' },
      include: { user: { select: { id: true, username: true } } },
    })

    let newLeader = false
    let isFirstLeader = false
    let previousLeader: string | undefined

    if (!topScore) {
      // No scores yet - user will be first leader
      newLeader = true
      isFirstLeader = true
    } else if (topScore.userId !== userId && validated.score > topScore.score) {
      // User is dethroning the current leader
      newLeader = true
      previousLeader = topScore.user.username
    }

    // Upsert score
    await prisma.score.upsert({
      where: {
        userId_gameId: {
          userId,
          gameId: validated.gameId,
        },
      },
      update: {
        score: validated.score,
        achievedAt: validated.achievedAt || new Date(),
      },
      create: {
        userId,
        gameId: validated.gameId,
        score: validated.score,
        achievedAt: validated.achievedAt || new Date(),
      },
    })

    // Update user stats
    await updateUserStats(userId)

    // Check for achievements
    await checkAchievements(userId)

    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    revalidatePath('/score-entry')

    return {
      success: true,
      message: 'Score submitted successfully',
      ...(newLeader && {
        newLeader: true,
        gameName: game?.name,
        isFirstLeader,
        previousLeader,
      }),
    }
  } catch (error) {
    console.error('Error submitting score:', error)
    return { success: false, message: 'Failed to submit score' }
  }
}

async function updateUserStats(userId: string) {
  const stats = await prisma.score.groupBy({
    by: ['userId'],
    where: { userId },
    _count: { gameId: true },
    _sum: { score: true },
  })

  const gameCount = stats[0]?._count.gameId || 0
  const totalScore = stats[0]?._sum.score || 0

  // Calculate rank
  const allUsers = await prisma.score.groupBy({
    by: ['userId'],
    _count: { gameId: true },
  })

  const sortedUsers = allUsers.sort((a, b) => b._count.gameId - a._count.gameId)
  const rank = sortedUsers.findIndex((u) => u.userId === userId) + 1

  await prisma.userStats.upsert({
    where: { userId },
    update: {
      totalGamesPlayed: gameCount,
      totalScoreSum: BigInt(totalScore),
      rankByGameCount: rank,
    },
    create: {
      userId,
      totalGamesPlayed: gameCount,
      totalScoreSum: BigInt(totalScore),
      rankByGameCount: rank,
    },
  })
}

async function checkAchievements(userId: string) {
  const scores = await prisma.score.findMany({
    where: { userId },
    distinct: ['gameId'],
  })

  const gameCount = scores.length
  const achievements = await prisma.achievement.findMany({
    where: { userId },
  })

  const unlockedTypes = new Set(achievements.map((a) => a.type))

  // Check for achievements
  if (gameCount >= 1 && !unlockedTypes.has('FIRST_SCORE')) {
    await prisma.achievement.create({
      data: { userId, type: 'FIRST_SCORE' },
    })
  }

  if (gameCount >= 5 && !unlockedTypes.has('FIVE_GAMES')) {
    await prisma.achievement.create({
      data: { userId, type: 'FIVE_GAMES' },
    })
  }

  if (gameCount >= 10 && !unlockedTypes.has('TEN_GAMES')) {
    await prisma.achievement.create({
      data: { userId, type: 'TEN_GAMES' },
    })
  }

  // Check for top 10
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  })

  if (userStats?.rankByGameCount && userStats.rankByGameCount <= 10 && !unlockedTypes.has('TOP_10')) {
    await prisma.achievement.create({
      data: { userId, type: 'TOP_10' },
    })
  }
}

export async function deleteScore(userId: string, scoreId: string) {
  try {
    // Verify the score belongs to the user (security check)
    const score = await prisma.score.findUnique({
      where: { id: scoreId },
    })

    if (!score) {
      return { success: false, message: 'Score not found' }
    }

    if (score.userId !== userId) {
      return { success: false, message: 'Unauthorized: You can only delete your own scores' }
    }

    // Delete the score
    await prisma.score.delete({
      where: { id: scoreId },
    })

    // Update user stats
    await updateUserStats(userId)

    // Recheck achievements (will add new ones if conditions are met)
    // Note: This doesn't remove achievements if user no longer qualifies
    await checkAchievements(userId)

    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    revalidatePath('/score-entry')

    return { success: true, message: 'Score deleted successfully' }
  } catch (error) {
    console.error('Error deleting score:', error)
    return { success: false, message: 'Failed to delete score' }
  }
}

export async function getUserScores(userId: string) {
  return prisma.score.findMany({
    where: { userId },
    include: {
      game: true,
    },
    orderBy: {
      achievedAt: 'desc',
    },
  })
}
