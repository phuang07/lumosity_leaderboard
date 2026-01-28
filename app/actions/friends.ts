'use server'

import { prisma } from '@/lib/prisma'
import { friendRequestSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function sendFriendRequest(userId: string, friendId: string) {
  try {
    const validated = friendRequestSchema.parse({ friendId })

    if (userId === validated.friendId) {
      return { success: false, message: 'Cannot send friend request to yourself' }
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: validated.friendId },
          { userId: validated.friendId, friendId: userId },
        ],
      },
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return { success: false, message: 'Already friends' }
      }
      if (existing.status === 'PENDING') {
        return { success: false, message: 'Friend request already pending' }
      }
    }

    await prisma.friendship.create({
      data: {
        userId,
        friendId: validated.friendId,
        status: 'PENDING',
      },
    })

    revalidatePath('/friends')
    return { success: true, message: 'Friend request sent' }
  } catch (error) {
    console.error('Error sending friend request:', error)
    return { success: false, message: 'Failed to send friend request' }
  }
}

export async function acceptFriendRequest(userId: string, requestId: string) {
  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    })

    if (!friendship || friendship.friendId !== userId) {
      return { success: false, message: 'Friend request not found' }
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    })

    revalidatePath('/friends')
    return { success: true, message: 'Friend request accepted' }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return { success: false, message: 'Failed to accept friend request' }
  }
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId, status: 'ACCEPTED' },
        { friendId: userId, status: 'ACCEPTED' },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      friend: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  })

  return friendships.map((f) => (f.userId === userId ? f.friend : f.user))
}

export async function getFriendRequests(userId: string) {
  return prisma.friendship.findMany({
    where: {
      friendId: userId,
      status: 'PENDING',
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
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
    orderBy: {
      username: 'asc',
    },
  })
}

export async function compareWithFriend(userId: string, friendId: string) {
  const [userScores, friendScores] = await Promise.all([
    prisma.score.findMany({
      where: { userId },
      include: { game: true },
    }),
    prisma.score.findMany({
      where: { userId: friendId },
      include: { game: true },
    }),
  ])

  const userScoreMap = new Map(userScores.map((s) => [s.gameId, s.score]))
  const friendScoreMap = new Map(friendScores.map((s) => [s.gameId, s.score]))

  const allGameIds = new Set([...userScoreMap.keys(), ...friendScoreMap.keys()])

  const comparisons = Array.from(allGameIds).map((gameId) => {
    const userScore = userScoreMap.get(gameId)
    const friendScore = friendScoreMap.get(gameId)
    const game = userScores.find((s) => s.gameId === gameId)?.game || friendScores.find((s) => s.gameId === gameId)?.game

    let result: 'win' | 'loss' | 'tie' | 'not_played' = 'not_played'
    if (userScore && friendScore) {
      if (userScore > friendScore) result = 'win'
      else if (userScore < friendScore) result = 'loss'
      else result = 'tie'
    } else if (userScore && !friendScore) {
      result = 'win'
    } else if (!userScore && friendScore) {
      result = 'loss'
    }

    return {
      gameId,
      gameName: game?.name || 'Unknown',
      userScore: userScore || null,
      friendScore: friendScore || null,
      result,
    }
  })

  const wins = comparisons.filter((c) => c.result === 'win').length
  const losses = comparisons.filter((c) => c.result === 'loss').length

  return {
    comparisons,
    record: { wins, losses },
    userGamesCount: userScores.length,
    friendGamesCount: friendScores.length,
  }
}
