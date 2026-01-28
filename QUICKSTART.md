# Quick Start Guide

Get your Concept2 Leaderboard up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Discord account and server
- A Concept2 Logbook account

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Concept2 Leaderboard" (or your choice)
4. Go to "OAuth2" → "General"
5. Click "Add Redirect" and enter: `http://localhost:3000/api/auth/callback/discord`
6. Copy your **Client ID** and **Client Secret**
7. Enable "Developer Mode" in Discord settings (User Settings → Advanced)
8. Right-click your server → "Copy Server ID"

## Step 3: Set Up Concept2 OAuth

1. Go to [Concept2 API Keys](https://log.concept2.com/developers/keys)
2. Sign in with your Concept2 account
3. Click "Register New Application"
4. Fill in:
   - Name: "Concept2 Leaderboard"
   - Redirect URI: `http://localhost:3000/auth/concept2/callback`
5. Copy your **Client ID** and **Client Secret**

## Step 4: Configure Environment

Create `.env.local` file in the root directory:

```env
# Discord OAuth
DISCORD_CLIENT_ID=paste_your_discord_client_id_here
DISCORD_CLIENT_SECRET=paste_your_discord_client_secret_here
DISCORD_SERVER_ID=paste_your_discord_server_id_here

# Concept2 OAuth
CONCEPT2_CLIENT_ID=paste_your_concept2_client_id_here
CONCEPT2_CLIENT_SECRET=paste_your_concept2_client_secret_here
CONCEPT2_REDIRECT_URI=http://localhost:3000/auth/concept2/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run_this_command_in_terminal_to_generate

# Database
DATABASE_URL="file:./dev.db"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` value.

## Step 5: Initialize Database

```bash
npx prisma migrate dev
```

When prompted for a migration name, just press Enter (will use default).

## Step 6: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test It Out

1. Click "Sign in with Discord"
2. Authorize the application
3. You'll be redirected to the onboarding page
4. Click "Link Concept2 Account"
5. Authorize Concept2 access
6. You'll be redirected to the leaderboard!

## Troubleshooting

### "Not in Server" Error
- Make sure you copied the correct Server ID
- Ensure you're a member of that Discord server
- Try leaving and rejoining the server

### "NEXTAUTH_SECRET not configured"
- Make sure you generated a secret using `openssl rand -base64 32`
- Ensure it's in your `.env.local` file

### "Failed to fetch workout data"
- Check your Concept2 credentials
- Make sure you have workouts in your Concept2 Logbook
- Try unlinking and relinking your Concept2 account

### Database Errors
- Delete `prisma/dev.db` and run `npx prisma migrate dev` again
- Make sure you're in the project directory

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## What's Next?

### Invite Your Training Partners
1. Make sure they're in your Discord server
2. Send them the app URL
3. They'll need to sign in with Discord and link their Concept2 accounts

### Customize
- Update the app title in `app/layout.tsx`
- Change colors in `tailwind.config.ts`
- Modify the README for your group

### Deploy to Production
See the main README.md for deployment instructions to Vercel.

## Common Questions

**Q: Can I use this without Discord?**
A: No, Discord OAuth is required for authentication and access control.

**Q: How often does data refresh?**
A: Automatically every minute, or click the refresh button for immediate updates.

**Q: Can I see other people's individual workouts?**
A: No, only aggregated totals are shown for privacy.

**Q: What if someone doesn't want to link their Concept2?**
A: They won't appear on the leaderboard, but can still sign in with Discord.

**Q: Can I run multiple leaderboards for different servers?**
A: Yes, deploy separate instances with different `DISCORD_SERVER_ID` values.

## Need Help?

- Check the full README.md for detailed documentation
- Review IMPLEMENTATION_SUMMARY.md for technical details
- Open an issue on GitHub if you encounter bugs

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create new migration
npx prisma generate     # Regenerate Prisma Client

# Utilities
npm run lint            # Run ESLint
```

---

Enjoy your Concept2 Leaderboard! 🚣‍♂️
