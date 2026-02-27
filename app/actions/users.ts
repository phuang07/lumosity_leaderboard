'use server'

import crypto from 'crypto'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUser } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'

const updateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  avatarUrl: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export type UpdateUserResult = {
  success: boolean
  message: string
  updatedUser?: {
    id: string
    username: string
    email: string
    avatarUrl: string | null
    role: UserRole
  }
}

export async function updateUser(input: UpdateUserInput): Promise<UpdateUserResult> {
  const parsed = updateUserSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid user update payload',
    }
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { success: false, message: 'You must be logged in to update user information' }
  }

  const isAdmin = currentUser.role === 'ADMIN'
  const isSelfUpdate = currentUser.id === parsed.data.userId

  if (!isAdmin && !isSelfUpdate) {
    return { success: false, message: 'You can only update your own profile' }
  }

  if (!isAdmin && parsed.data.role !== undefined) {
    return { success: false, message: 'Only admins can change user roles' }
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, role: true },
    })

    if (!targetUser) {
      return { success: false, message: 'User not found' }
    }

    if (isAdmin && parsed.data.role === 'MEMBER' && targetUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount <= 1) {
        return { success: false, message: 'At least one admin account must remain in the system' }
      }
    }

    const normalizedUsername = parsed.data.username.trim()
    const normalizedEmail = parsed.data.email.trim().toLowerCase()
    const normalizedAvatarUrl = parsed.data.avatarUrl?.trim() || ''

    if (normalizedAvatarUrl.length > 0) {
      const avatarValidation = z.string().url('Avatar URL must be a valid URL').safeParse(normalizedAvatarUrl)
      if (!avatarValidation.success) {
        return { success: false, message: avatarValidation.error.issues[0]?.message || 'Avatar URL must be a valid URL' }
      }
    }

    const conflict = await prisma.user.findFirst({
      where: {
        id: { not: parsed.data.userId },
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
      select: {
        email: true,
        username: true,
      },
    })

    if (conflict) {
      if (conflict.email === normalizedEmail) {
        return { success: false, message: 'Email is already in use by another account' }
      }
      if (conflict.username === normalizedUsername) {
        return { success: false, message: 'Username is already in use by another account' }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parsed.data.userId },
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        avatarUrl: normalizedAvatarUrl.length > 0 ? normalizedAvatarUrl : null,
        ...(isAdmin && parsed.data.role ? { role: parsed.data.role } : {}),
        ...(parsed.data.password ? { passwordHash: hashPassword(parsed.data.password) } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/score-entry')
    revalidatePath('/friends/compare')
    revalidatePath('/user-management')

    return {
      success: true,
      message: 'User information updated successfully',
      updatedUser,
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      message: 'Failed to update user information. Please try again.',
    }
  }
}
