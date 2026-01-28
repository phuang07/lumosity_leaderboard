/**
 * Centralized configuration management
 * Separates development and production environment settings
 */

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

/**
 * Application configuration
 * All environment variables should be accessed through this config object
 */
export const config = {
  // Environment
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment,
    isProduction,
    isTest,
  },

  // Database
  database: {
    url: (() => {
      const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard'
      // Debug: Log the actual DATABASE_URL being used (masked) - always log in dev
      const nodeEnv = process.env.NODE_ENV || 'development'
      const maskedUrl = url.replace(/:([^:@]+)@/, ':****@')
      console.log('[Config] NODE_ENV:', nodeEnv)
      console.log('[Config] DATABASE_URL from process.env:', maskedUrl)
      console.log('[Config] Raw DATABASE_URL exists:', !!process.env.DATABASE_URL)
      console.log('[Config] DATABASE_URL length:', url.length)
      console.log('[Config] Is localhost?', url.includes('localhost'))
      
      // Warn if using non-local database in development
      if (nodeEnv === 'development' && !url.includes('localhost')) {
        console.warn('[Config] ⚠️  WARNING: Using non-local database in development mode!')
        console.warn('[Config] Expected localhost, but got:', maskedUrl)
      }
      
      return url
    })(),
  },

  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || (isDevelopment ? 'http://localhost:3000' : ''),
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Lumosity Leaderboard',
  },

  // Security
  security: {
    cookieSecure: isProduction,
    cookieSameSite: 'lax' as const,
    cookieMaxAge: 60 * 60 * 24 * 7, // 1 week
  },

  // API
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    enableConsole: isDevelopment,
  },
} as const

/**
 * Validate required environment variables
 * Call this during application startup
 */
export function validateConfig() {
  const errors: string[] = []

  if (isProduction && !process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required in production')
  }

  if (isProduction && !process.env.NEXT_PUBLIC_APP_URL) {
    console.warn('Warning: NEXT_PUBLIC_APP_URL is not set in production')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }
}

// Validate config on import in production
if (isProduction) {
  validateConfig()
}
