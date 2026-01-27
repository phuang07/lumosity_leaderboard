import { PrismaClient, GameCategory } from '@prisma/client'
import 'dotenv/config'

// Import from lib/prisma.ts which handles Prisma 7 initialization correctly
// But for seed script, we need to ensure DATABASE_URL is available
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard'

// Set it in process.env so prisma.config.ts can read it
process.env.DATABASE_URL = connectionString

// Use the same pattern as lib/prisma.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const games = [
  // Attention Games
  { name: 'Speed Match', category: GameCategory.ATTENTION, description: 'Match symbols quickly' },
  { name: 'Train of Thought', category: GameCategory.ATTENTION, description: 'Follow the train' },
  { name: 'Ebb and Flow', category: GameCategory.ATTENTION, description: 'Track moving objects' },
  { name: 'Color Match', category: GameCategory.ATTENTION, description: 'Match colors accurately' },
  { name: 'Lost in Migration', category: GameCategory.ATTENTION, description: 'Follow the migrating birds' },
  { name: 'Divided Attention', category: GameCategory.ATTENTION, description: 'Focus on multiple tasks' },
  { name: 'Trouble Brewing', category: GameCategory.ATTENTION, description: 'Monitor multiple stations' },
  { name: 'Disillusion', category: GameCategory.ATTENTION, description: 'Find the odd one out' },
  { name: 'Eagle Eye', category: GameCategory.ATTENTION, description: 'Spot the differences' },
  { name: 'Reflex Ridge', category: GameCategory.ATTENTION, description: 'Quick reaction game' },
  { name: 'Pet Detective', category: GameCategory.ATTENTION, description: 'Find hidden pets' },
  { name: 'Spatial Speed Match', category: GameCategory.ATTENTION, description: 'Match spatial patterns' },

  // Memory Games
  { name: 'Memory Matrix', category: GameCategory.MEMORY, description: 'Remember grid patterns' },
  { name: 'Memory Lane', category: GameCategory.MEMORY, description: 'Recall sequences' },
  { name: 'Memory Match', category: GameCategory.MEMORY, description: 'Match pairs' },
  { name: 'Word Bubbles', category: GameCategory.MEMORY, description: 'Remember word sequences' },
  { name: 'Monkey Ladder', category: GameCategory.MEMORY, description: 'Remember sequences' },
  { name: 'Memory Racer', category: GameCategory.MEMORY, description: 'Race with memory' },
  { name: 'Memory Match Pro', category: GameCategory.MEMORY, description: 'Advanced matching' },
  { name: 'Spatial Memory', category: GameCategory.MEMORY, description: 'Remember locations' },
  { name: 'Working Memory', category: GameCategory.MEMORY, description: 'Hold information' },
  { name: 'Memory Palace', category: GameCategory.MEMORY, description: 'Build memory palaces' },

  // Flexibility Games
  { name: 'Word Bubbles Rising', category: GameCategory.FLEXIBILITY, description: 'Flexible word finding' },
  { name: 'Switching Stations', category: GameCategory.FLEXIBILITY, description: 'Switch between tasks' },
  { name: 'Task Switching', category: GameCategory.FLEXIBILITY, description: 'Switch mental sets' },
  { name: 'Brain Shift', category: GameCategory.FLEXIBILITY, description: 'Shift perspectives' },
  { name: 'Color Match Pro', category: GameCategory.FLEXIBILITY, description: 'Advanced color matching' },
  { name: 'Mental Flexibility', category: GameCategory.FLEXIBILITY, description: 'Adapt thinking' },
  { name: 'Set Shifting', category: GameCategory.FLEXIBILITY, description: 'Shift between sets' },
  { name: 'Cognitive Flexibility', category: GameCategory.FLEXIBILITY, description: 'Flexible thinking' },

  // Speed Games
  { name: 'Speed Match Pro', category: GameCategory.SPEED, description: 'Advanced speed matching' },
  { name: 'Rush Hour', category: GameCategory.SPEED, description: 'Quick decisions' },
  { name: 'Speed Processing', category: GameCategory.SPEED, description: 'Process quickly' },
  { name: 'Rapid Fire', category: GameCategory.SPEED, description: 'Quick responses' },
  { name: 'Lightning Round', category: GameCategory.SPEED, description: 'Speed challenge' },
  { name: 'Quick Draw', category: GameCategory.SPEED, description: 'Fast reactions' },
  { name: 'Speed Test', category: GameCategory.SPEED, description: 'Test your speed' },
  { name: 'Fast Track', category: GameCategory.SPEED, description: 'Speed track' },
  { name: 'Velocity', category: GameCategory.SPEED, description: 'High speed game' },
  { name: 'Turbo Mode', category: GameCategory.SPEED, description: 'Maximum speed' },

  // Problem Solving Games
  { name: 'Raindrops', category: GameCategory.PROBLEM_SOLVING, description: 'Solve math problems' },
  { name: 'Rotation Matrix', category: GameCategory.PROBLEM_SOLVING, description: 'Rotate and solve' },
  { name: 'Problem Solver', category: GameCategory.PROBLEM_SOLVING, description: 'Solve puzzles' },
  { name: 'Logic Puzzle', category: GameCategory.PROBLEM_SOLVING, description: 'Logical reasoning' },
  { name: 'Number Crunch', category: GameCategory.PROBLEM_SOLVING, description: 'Number puzzles' },
  { name: 'Spatial Reasoning', category: GameCategory.PROBLEM_SOLVING, description: 'Spatial puzzles' },
  { name: 'Pattern Recognition', category: GameCategory.PROBLEM_SOLVING, description: 'Find patterns' },
  { name: 'Critical Thinking', category: GameCategory.PROBLEM_SOLVING, description: 'Think critically' },
  { name: 'Analytical Mind', category: GameCategory.PROBLEM_SOLVING, description: 'Analyze problems' },
  { name: 'Strategic Planning', category: GameCategory.PROBLEM_SOLVING, description: 'Plan strategically' },
]

async function main() {
  console.log('Seeding database...')

  // Create games
  for (const game of games) {
    await prisma.game.upsert({
      where: { name: game.name },
      update: {},
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
