import { PrismaClient, GameCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from '../lib/config'

// Use the same pattern as lib/prisma.ts for Prisma 7
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 requires an adapter for database connections
const connectionString = config.database.url
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (!config.env.isProduction) globalForPrisma.prisma = prisma

// Read games from JSON file
function loadGamesFromJSON() {
  try {
    const jsonPath = join(process.cwd(), 'data', 'games.json')
    const fileContent = readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)

    if (!data.games || !Array.isArray(data.games)) {
      throw new Error('Invalid JSON structure: expected "games" array')
    }

    // Map JSON data to Prisma format, converting category string to enum
    return data.games.map((game: { name: string; description: string; category: string; icon?: string }) => {
      // Validate and convert category string to enum
      const categoryMap: Record<string, GameCategory> = {
        ATTENTION: GameCategory.ATTENTION,
        MEMORY: GameCategory.MEMORY,
        FLEXIBILITY: GameCategory.FLEXIBILITY,
        SPEED: GameCategory.SPEED,
        PROBLEM_SOLVING: GameCategory.PROBLEM_SOLVING,
      }

      const category = categoryMap[game.category]
      if (!category) {
        throw new Error(`Invalid category "${game.category}" for game "${game.name}". Must be one of: ATTENTION, MEMORY, FLEXIBILITY, SPEED, PROBLEM_SOLVING`)
      }

      return {
        name: game.name,
        description: game.description,
        category: category,
        icon: game.icon || null,
      }
    })
  } catch (error) {
    console.error('Error loading games from JSON:', error)
    throw error
  }
}

const games = loadGamesFromJSON()

async function main() {
  console.log('Seeding database...')

  // Create games
  for (const game of games) {
    await prisma.game.upsert({
      where: { name: game.name },
      update: {
        description: game.description,
        category: game.category,
        icon: game.icon,
      },
      create: game,
    })
  }

  console.log(`✅ Seeded ${games.length} games`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
