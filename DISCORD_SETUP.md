# Discord Weekly Summary Setup

## Step 1: Create a Discord Webhook

1. Go to your Discord server
2. Right-click on the `#erg-warriors` channel → **Edit Channel**
3. Go to **Integrations** → **Webhooks**
4. Click **New Webhook**
5. Name it something like "Leaderboard Bot"
6. Copy the **Webhook URL**
7. Click **Save Changes**

## Step 2: Configure Environment Variables

Edit `.env.local` and update:

```env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN"
WEBHOOK_SECRET="some-random-secret-string-here"
```

Generate a random secret:
```bash
openssl rand -base64 32
```

## Step 3: Test the Endpoint

### Test in Browser:
```
https://localhost:3000/api/discord/weekly-summary?token=YOUR_WEBHOOK_SECRET
```

Replace `YOUR_WEBHOOK_SECRET` with the value from your `.env.local`

### Test with curl:
```bash
curl https://localhost:3000/api/discord/weekly-summary \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

## Step 4: Set Up Automated Scheduling

### Option A: Vercel Cron Jobs (Recommended for Production)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/discord/weekly-summary",
      "schedule": "0 12 * * 0"
    }
  ]
}
```

2. Update the API route to check for Vercel cron secret (see below)

3. Deploy to Vercel - cron jobs work automatically

**Schedule format**: `"0 12 * * 0"` = Every Sunday at 12:00 PM (noon)
- Format: `minute hour day month weekday`
- Examples:
  - `"0 12 * * 0"` - Every Sunday at noon
  - `"0 9 * * 1"` - Every Monday at 9 AM
  - `"0 17 * * 5"` - Every Friday at 5 PM

### Option B: External Cron Service (for development/testing)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Sign up for a free account
2. Create a new cron job
3. Set URL: `https://your-domain.com/api/discord/weekly-summary?token=YOUR_SECRET`
4. Set schedule: Every Sunday at 12:00 PM
5. Enable the job

### Option C: Linux Crontab (if self-hosting)

1. Open crontab:
```bash
crontab -e
```

2. Add this line (runs every Sunday at noon):
```cron
0 12 * * 0 curl -X GET "https://your-domain.com/api/discord/weekly-summary?token=YOUR_SECRET" >/dev/null 2>&1
```

## Cron Schedule Examples

```
# Every Sunday at 12:00 PM (noon)
0 12 * * 0

# Every Monday at 9:00 AM
0 9 * * 1

# Every day at 8:00 AM
0 8 * * *

# Every Friday at 5:00 PM
0 17 * * 5
```

## Security Notes

- Keep your `WEBHOOK_SECRET` private
- Don't commit it to git (it's in `.env.local` which is gitignored)
- For production, use Vercel's built-in cron authentication
- The Discord webhook URL should also be kept private
