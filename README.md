# Lumosity Leaderboard

A web application for comparing Lumosity game scores with friends, featuring rankings, friend comparisons, and gamification elements.

## Features

- 🎮 Score submission for 50+ Lumosity games across 5 categories
- 👥 Friend system with requests and comparisons
- 📊 Global and friend leaderboards
- 🏆 Achievement system
- 📈 Progress tracking and streaks
- 🔐 User authentication (register, login, logout)
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Authentication**: Cookie-based session authentication
- **Testing**: Cypress for end-to-end testing

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- PostgreSQL database (see options below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lumosity_leaderboard
```

2. Install dependencies:
```bash
npm install
```

### Database Setup

Create a `.env` file in the root directory with your database connection string.

#### Option A: Docker PostgreSQL (Easiest)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Use this connection string in .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"
```

#### Option B: Local PostgreSQL

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumosity_leaderboard"
```

Replace with your actual credentials:
- Username: usually `postgres` or your PostgreSQL username
- Password: your PostgreSQL password
- Port: usually `5432` (default PostgreSQL port)
- Database: `lumosity_leaderboard` (will be created automatically)

#### Option C: Cloud Database

You can use free tiers from:
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)

Example for Supabase:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

> **Note:** For local development, use a direct `postgresql://` connection string. The `prisma+postgres://` format is for Prisma Accelerate (cloud/production).

### Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npx prisma db push

# Seed the database with Lumosity games
npm run db:seed
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Dashboard** - View your stats, progress, and achievements
4. **Submit Scores** - Add your Lumosity scores at `/score-entry`
5. **Leaderboard** - Compare with others at `/leaderboard`
6. **Compare Friends** - Head-to-head comparison at `/friends/compare`

## Project Structure

```
lumosity_leaderboard/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions (auth, scores, friends)
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── leaderboard/      # Leaderboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── score-entry/      # Score entry page
├── components/           # React components
├── cypress/              # Cypress e2e tests
│   ├── e2e/             # Test spec files
│   ├── fixtures/        # Test data
│   └── support/         # Custom commands
├── lib/                  # Utility functions
├── prisma/               # Prisma schema and migrations
└── designs/             # Static design mockups
```

## Database Schema

| Table | Description |
|-------|-------------|
| **Users** | User accounts with authentication |
| **Games** | 50+ Lumosity games catalog |
| **Scores** | User scores (highest per game) |
| **Friendships** | Friend relationships and requests |
| **Achievements** | User achievement progress |
| **UserStats** | Cached statistics for performance |

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with games |
| `npm run cypress` | Open Cypress Test Runner (interactive) |
| `npm run cypress:run` | Run Cypress tests headlessly |
| `npm run test:e2e` | Alias for `cypress:run` |
| `npm run test:e2e:headed` | Run tests with browser visible |

## Testing

This project uses [Cypress](https://www.cypress.io/) for end-to-end testing.

### Running Tests

1. Make sure the development server is running:
```bash
npm run dev
```

2. In a separate terminal, run the tests:
```bash
# Interactive mode (opens Cypress UI)
npm run cypress

# Headless mode (for CI)
npm run cypress:run
```

### Test Coverage

The test suite covers the following authentication flows:

**Login Page UI**
- Displays all form elements correctly
- Links to register page

**Login Validation**
- Invalid email format validation
- Empty password validation
- Incorrect credentials error handling
- Wrong password with existing email

**Successful Login**
- Valid credentials redirect to dashboard
- Loading state during submission
- Session persistence after page reload

**Logout**
- Logout redirects to login page
- Cannot access protected routes after logout

**Protected Routes**
- Dashboard redirects to login when not authenticated
- Score-entry redirects to login when not authenticated

### Writing New Tests

Test files are located in `cypress/e2e/`. Custom commands are defined in `cypress/support/commands.ts`:

```typescript
// Login via UI
cy.login('user@example.com', 'password')

// Register a new user
cy.register('username', 'email@example.com', 'password')

// Logout
cy.logout()
```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running (`docker-compose up -d` if using Docker)
- Check firewall/network settings for cloud databases

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Sync schema to database
npx prisma db push
```

### Build Errors
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

### Port Already in Use
The app will automatically use port 3001 if 3000 is busy. Check the terminal output for the actual URL.

## Design

Static HTML/CSS mockups are available in the `designs/static/` folder. These serve as reference for the application's UI/UX design.

## License

MIT
