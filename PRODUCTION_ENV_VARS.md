# Production Environment Variables

## Quick Reference for Vercel Deployment

Use these environment variables in **Vercel Dashboard → Settings → Environment Variables**:

### Discord OAuth (Production)
```env
DISCORD_CLIENT_ID=1465186912804536442
DISCORD_CLIENT_SECRET=3tOeCivhHrkGtnuzyp0dUgelo9SsQtkI
DISCORD_SERVER_ID=1045798370746302594
```

### Concept2 OAuth
```env
CONCEPT2_CLIENT_ID=oo0IKfRbbdYfUgfdXDBi6L8vKqIJP584EgVJqC6Z
CONCEPT2_CLIENT_SECRET=wePUcIB5HcWDOJ1tr5lg8xeyuEPfwVUgZ1PrDHlq
CONCEPT2_REDIRECT_URI=https://YOUR_VERCEL_URL.vercel.app/auth/concept2/callback
```

### NextAuth (Generate new secret for production!)
```env
NEXTAUTH_URL=https://YOUR_VERCEL_URL.vercel.app
NEXTAUTH_SECRET=GENERATE_NEW_SECRET_WITH_openssl_rand_-base64_32
```

### Database (Production PostgreSQL)
```env
DATABASE_URL=postgresql://neondb_owner:npg_vCmwAPzF78jD@ep-shiny-pond-ah4ipgff-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### App Configuration
```env
NEXT_PUBLIC_APP_NAME=UW Erg Warrior Leaderboard
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_URL.vercel.app
```

### Discord Webhook for Weekly Summary
```env
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/1466246026498277590/gFtN4rb3HK-Sm8AQQ4p1biqXMGVZg0Y6ZnxgjLEOuo44iQmgVzpqY98CKq5EvgCYN2HU
WEBHOOK_SECRET=test-secret-123
```

### Vercel Cron Secret (Leave blank - Vercel auto-generates)
```env
CRON_SECRET=
```

---

## Important Notes

### Discord Server IDs
- **Production**: `1045798370746302594` (UWaterloo Rowing Team server)
- **Development**: `1466219412519522346` (Test server)

### Generate New Secrets for Production
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate WEBHOOK_SECRET (optional, or keep test-secret-123)
openssl rand -base64 32
```

### After First Deploy
1. Get your Vercel URL (e.g., `https://erg-warriors.vercel.app`)
2. Update these environment variables with your actual URL:
   - `NEXTAUTH_URL`
   - `CONCEPT2_REDIRECT_URI`
   - `NEXT_PUBLIC_APP_URL`
3. **Redeploy** in Vercel
4. Update OAuth redirect URIs in Discord and Concept2 apps

### OAuth Redirect URIs to Add

**Discord App** (https://discord.com/developers/applications):
- `https://YOUR_VERCEL_URL.vercel.app/api/auth/callback/discord`

**Concept2 App** (https://log.concept2.com/developers/keys):
- `https://YOUR_VERCEL_URL.vercel.app/auth/concept2/callback`

---

## Testing Checklist

After deployment:
- [ ] Can sign in with Discord (production server members only)
- [ ] Can link Concept2 account
- [ ] Leaderboard displays correctly
- [ ] Dark mode toggle works
- [ ] Test Discord summary: `https://YOUR_URL.vercel.app/api/discord/weekly-summary?token=test-secret-123`
- [ ] Verify weekly cron job is configured (Vercel Dashboard → Cron Jobs)
