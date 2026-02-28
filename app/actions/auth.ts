'use server'

import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import { sendPasswordResetEmail } from '@/lib/email'
import { cookies, headers } from 'next/headers'
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
      return { success: false, error: 'Invalid email or password' }
    }

    // Check password
    const passwordHash = hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password' }
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

export type RequestPasswordResetResult = {
  success: boolean
  error?: string
  /** In development, the reset link is returned for testing (no email sent) */
  resetLink?: string
}

export async function requestPasswordReset(formData: FormData): Promise<RequestPasswordResetResult> {
  const email = (formData.get('email') as string)?.trim()?.toLowerCase()

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true }
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      }
    })

    // Use request origin when available (correct port for dev/E2E), else config
    let appUrl = config.app.url || 'http://localhost:3000'
    try {
      const headersList = await headers()
      const host = headersList.get('x-forwarded-host') || headersList.get('host')
      const proto = headersList.get('x-forwarded-proto') || (config.security.cookieSecure ? 'https' : 'http')
      if (host) {
        appUrl = `${proto}://${host}`
      }
    } catch {
      // headers() may throw in some edge cases
    }
    const resetLink = `${appUrl}/reset-password?token=${token}`

    // Send email when SMTP is configured (production)
    if (config.smtp.isConfigured) {
      const emailResult = await sendPasswordResetEmail(user.email, resetLink)
      if (!emailResult.success) {
        console.error('[Password Reset] Email failed:', emailResult.error)
        // In development, include the actual error to help debug SMTP config (e.g. Gmail App Password)
        const errorMsg =
          config.env.isDevelopment && emailResult.error
            ? `Failed to send reset email: ${emailResult.error}`
            : 'Failed to send reset email. Please try again later.'
        return { success: false, error: errorMsg }
      }
      return { success: true }
    }

    // In development, or when E2E_PASSWORD_RESET_LINK=true (CI), return the link for testing
    if (config.env.isDevelopment || config.e2ePasswordResetLink) {
      console.log('[Password Reset] Dev/E2E mode (no SMTP) - reset link:', resetLink)
      return { success: true, resetLink }
    }

    // Production without SMTP configured
    console.error('[Password Reset] SMTP not configured - cannot send reset email to', email)
    return { success: false, error: 'Email service is not configured. Please contact support.' }
  } catch (error) {
    console.error('Password reset request error:', error)
    // In development, surface the actual error to help debug (e.g. SMTP config issues)
    const message =
      config.env.isDevelopment && error instanceof Error
        ? `An error occurred: ${error.message}`
        : 'An error occurred. Please try again.'
    return { success: false, error: message }
  }
}

export type ResetPasswordResult = {
  success: boolean
  error?: string
}

export async function resetPassword(formData: FormData): Promise<ResetPasswordResult> {
  const token = (formData.get('token') as string)?.trim()
  const password = formData.get('password') as string

  if (!token) {
    return { success: false, error: 'Invalid or expired reset link' }
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired reset link. Please request a new one.' }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashPassword(password) }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ])

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    const message =
      config.env.isDevelopment && error instanceof Error
        ? `An error occurred: ${error.message}`
        : 'An error occurred. Please try again.'
    return { success: false, error: message }
  }
}
