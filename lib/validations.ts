import { z } from 'zod'

export const scoreSchema = z.object({
  gameId: z.string().uuid('Invalid game ID'),
  score: z.number().int().positive('Score must be a positive number'),
  achievedAt: z.date().optional(),
})

export const friendRequestSchema = z.object({
  friendId: z.string().uuid('Invalid friend ID'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
