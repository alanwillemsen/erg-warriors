# Erg Warriors 🏆

A Next.js web application that displays a leaderboard of rowing meters among training partners using the Concept2 Logbook API with configurable time periods.

## Features

- **Discord OAuth Authentication**: Sign in with Discord and restrict access to specific server members
- **Optional Concept2 Linking**: View the leaderboard without linking an account, or link to participate
- **Profile Management**: Customize your display name and control leaderboard visibility
- **Sortable Columns**: Click any column header to sort by rank, name, meters, workouts, hours, or last workout
- **Time Period Filtering**: View leaderboards for this week, month, or year
- **Real-time Updates**: Automatic data refresh with manual refresh option
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Statistics Dashboard**: View total meters, workouts, and top performers
- **Automatic Token Refresh**: Seamless OAuth token management
- **Configurable App Name**: Easily customize the app name via environment variable

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js v5 with Discord OAuth + Custom Concept2 OAuth
- **Database**: Prisma with SQLite (development) / PostgreSQL (production)
- **Data Fetching**: SWR for client-side with caching
- **Validation**: Zod for runtime type safety
- **Date Handling**: date-fns for time period calculations

## Prerequisites

- Node.js 18+ and npm
- Discord Application (for OAuth)
- Concept2 Application (for API access)
- Discord Server ID (for access control)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd concept2-leaderboard
npm install
```

### 2. Register Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to "OAuth2" section
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy the Client ID and Client Secret
6. Note your Discord Server ID (right-click server → Copy Server ID)

### 3. Register Concept2 Application

1. Go to [Concept2 Logbook API](https://log.concept2.com/developers/keys)
2. Register a new application
3. Set redirect URI: `http://localhost:3000/auth/concept2/callback`
4. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_SERVER_ID=your_server_id_to_restrict_access

# Concept2 OAuth
CONCEPT2_CLIENT_ID=your_concept2_client_id
CONCEPT2_CLIENT_SECRET=your_concept2_client_secret
CONCEPT2_REDIRECT_URI=http://localhost:3000/auth/concept2/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here

# Database
DATABASE_URL="file:./dev.db"

# App Configuration
NEXT_PUBLIC_APP_NAME="Erg Warriors"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. Initialize Database

```bash
npx prisma migrate dev
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Flow

1. **Sign In**: Click "Sign in with Discord" on the landing page
2. **Authorize Discord**: Authorize the app to access your Discord profile
3. **Server Check**: App verifies you're a member of the configured Discord server
4. **View Leaderboard**: Immediately view the leaderboard (no Concept2 required!)
5. **Optional - Link Concept2**: Click the banner or go to Profile to link your Concept2 account
6. **Authorize Concept2**: Authorize the app to read your workout data
7. **Compete**: Your workout data now appears on the leaderboard!

## Project Structure

```
concept2-leaderboard/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth.js handlers
│   │   └── leaderboard/            # Leaderboard data API
│   ├── auth/
│   │   ├── signin/                 # Discord sign-in page
│   │   ├── error/                  # Auth error page
│   │   └── concept2/               # Concept2 OAuth routes
│   ├── onboarding/                 # Concept2 linking flow
│   └── page.tsx                    # Main leaderboard page
├── components/
│   ├── leaderboard/                # Leaderboard components
│   ├── onboarding/                 # Onboarding components
│   ├── providers/                  # Context providers
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── auth/                       # NextAuth configuration
│   ├── concept2/                   # Concept2 API client
│   ├── discord/                    # Discord API helpers
│   ├── db/                         # Database operations
│   └── utils/                      # Utility functions
├── prisma/
│   └── schema.prisma               # Database schema
└── types/                          # TypeScript definitions
```

## API Endpoints

### GET /api/leaderboard

Fetch leaderboard data for a specific time period.

**Query Parameters:**
- `period`: `week` | `month` | `year` | `custom` (default: `week`)
- `from`: ISO date string (required for custom period)
- `to`: ISO date string (required for custom period)
- `refresh`: Set to `true` to bypass cache

**Response:**
```json
[
  {
    "rank": 1,
    "userId": "user-id",
    "discordId": "123456789",
    "discordName": "username",
    "discordAvatar": "avatar-hash",
    "totalMeters": 50000,
    "workoutCount": 10,
    "totalHours": 5.2,
    "lastWorkout": "2024-01-20"
  }
]
```

### POST /api/leaderboard

Clear the leaderboard cache (requires authentication).

## Database Schema

### User
- `id`: Unique identifier
- `discordId`: Discord user ID (unique)
- `discordName`: Discord username
- `discordAvatar`: Discord avatar hash
- `displayName`: Custom display name for leaderboard (optional)
- `showOnLeaderboard`: Visibility toggle (default: true)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Account
- OAuth account data (Discord + Concept2)
- Stores access tokens, refresh tokens, expiration
- Links users to external OAuth providers

### Session
- NextAuth.js session data
- JWT-based sessions

## Security Features

- **CSRF Protection**: State parameter in Concept2 OAuth flow
- **Server Membership Verification**: Only Discord server members can access
- **Encrypted Sessions**: HttpOnly, Secure, SameSite cookies
- **Automatic Token Refresh**: Tokens refreshed before expiration
- **Input Validation**: Zod schemas for all API inputs

## Caching Strategy

- **Memory Cache**: 5-minute TTL for leaderboard data
- **SWR Client Cache**: Stale-while-revalidate pattern
- **Manual Refresh**: Users can force cache invalidation
- **Auto-refresh**: Data refreshes every minute when viewing leaderboard

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update OAuth redirect URIs to production URLs
5. Deploy

### Docker

1. Create `Dockerfile` for containerization
2. Build image: `docker build -t concept2-leaderboard .`
3. Run container: `docker run -p 3000:3000 concept2-leaderboard`

### Environment Variables for Production

Update these values for production:
- `NEXTAUTH_URL`: Your production domain
- `CONCEPT2_REDIRECT_URI`: Production callback URL
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Strong random secret

## Troubleshooting

### "Not in Server" Error
- Ensure you're a member of the Discord server specified in `DISCORD_SERVER_ID`
- Verify the server ID is correct (right-click server → Copy Server ID with Developer Mode enabled)

### Concept2 Token Issues
- Tokens automatically refresh before expiration
- If refresh fails, unlink and re-link your Concept2 account
- Check Concept2 API status at https://log.concept2.com

### Database Issues
- Run `npx prisma migrate reset` to reset database (development only)
- Run `npx prisma generate` to regenerate Prisma Client
- Check database connection string in `.env`

## Development

```bash
# Run development server with turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review Concept2 API documentation: https://log.concept2.com/developers/documentation
