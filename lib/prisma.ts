import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from './config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  connectionString: string | undefined
}

// Prisma 7 requires an adapter for database connections
const connectionString = config.database.url

// Debug: Log the connection string (without password) in development
if (config.env.isDevelopment) {
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@')
  console.log('[Prisma] Using database URL from config:', maskedUrl)
  console.log('[Prisma] Connection string length:', connectionString.length)
  console.log('[Prisma] Is localhost?', connectionString.includes('localhost'))
}

// Check if connection string has changed - if so, disconnect old client and create new one
if (globalForPrisma.prisma && globalForPrisma.connectionString !== connectionString) {
  console.log('[Prisma] Connection string changed, disconnecting old client...')
  globalForPrisma.prisma.$disconnect().catch(() => {})
  globalForPrisma.prisma = undefined
  globalForPrisma.connectionString = undefined
}

// Create new Prisma client if needed
if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
  globalForPrisma.connectionString = connectionString
}

export const prisma = globalForPrisma.prisma

// Store in global for development hot-reload
if (!config.env.isProduction) {
  globalForPrisma.prisma = prisma
  globalForPrisma.connectionString = connectionString
}
