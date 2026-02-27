'use server'

import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Simple password hashing (for demo purposes - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export type AuthResult = {
  success: boolean
  error?: string
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validation
  if (!username || username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' }
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  try {
    const userCount = await prisma.user.count()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return { success: false, error: 'An account with this email already exists' }
      }
      return { success: false, error: 'This username is already taken' }
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        role: userCount === 0 ? 'ADMIN' : 'MEMBER',
        passwordHash: hashPassword(password),
      }
    })

    // Create initial user stats
    await prisma.userStats.create({
      data: {
        userId: user.id,
        totalGamesPlayed: 0,
        totalScoreSum: BigInt(0),
      }
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: config.security.cookieSecure,
      sameSite: config.security.cookieSameSite,
      maxAge: config.security.cookieMaxAge,
    })

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'An error occurred during registration. Please try again.' }
  }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  const loginIdentifier = ((formData.get('identifier') ?? formData.get('email')) as string | null)?.trim() || ''
  const password = formData.get('password') as string

  // Validation
  if (!loginIdentifier) {
    return { success: false, error: 'Please enter your username or email' }
  }

  if (!password) {
    return { success: false, error: 'Please enter your password' }
  }

  try {
    // Prefer exact email match first, then fall back to username.
    let user = await prisma.user.findUnique({
      where: { email: loginIdentifier.toLowerCase() }
    })

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: loginIdentifier }
      })
    }

    if (!user) {
      return { success: false, error: 'Invalid username/email or password' }
    }

    // Check password
    const passwordHash = hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid username/email or password' }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: config.security.cookieSecure,
      sameSite: config.security.cookieSameSite,
      maxAge: config.security.cookieMaxAge,
    })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login. Please try again.' }
  }
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    })
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
