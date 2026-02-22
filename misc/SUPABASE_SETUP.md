# Supabase Setup Guide for Magic Roulette

Complete guide to set up Supabase for the Magic Roulette backend.

## Why Supabase?

✅ **PostgreSQL Database** - Powerful relational database  
✅ **Real-time Subscriptions** - Built-in WebSocket support  
✅ **Authentication** - User management out of the box  
✅ **Row Level Security** - Database-level security  
✅ **Auto-generated APIs** - REST and GraphQL  
✅ **Storage** - File uploads (avatars, etc.)  
✅ **Edge Functions** - Serverless functions  
✅ **Free Tier** - 500MB database, 2GB bandwidth  

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in details:
   - **Name**: magic-roulette
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (or Pro for production)
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Your public API key
   - **service_role**: Your service role key (keep secret!)

3. Add to `backend/.env`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy entire contents of `backend/supabase/schema.sql`
4. Paste into SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. Wait for success message

This creates:
- All tables (users, games, transactions, etc.)
- Indexes for performance
- Row Level Security policies
- Materialized view for leaderboard
- Triggers for auto-updates
- Default badges

## Step 4: Verify Tables

1. Go to **Table Editor**
2. You should see these tables:
   - users
   - games
   - game_players
   - transactions
   - badges
   - user_badges
   - leaderboard (materialized view)

3. Click on each table to verify structure

## Step 5: Configure Authentication (Optional)

If you want to use Supabase Auth:

1. Go to **Authentication** → **Providers**
2. Enable providers you want:
   - Email/Password
   - Magic Link
   - OAuth (Google, GitHub, etc.)

3. Configure redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Step 6: Test Connection

```bash
cd backend

# Install dependencies
npm install

# Start server
npm run dev
```

You should see:
```
✅ Supabase clients initialized
🚀 Initializing services...
✅ Solana service initialized
✅ WebSocket server initialized
✅ All services initialized

🌐 Server running on port 3001
```

## Step 7: Test API

### Create a user:
```bash
curl -X POST http://localhost:3001/api/v1/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"}'
```

### Get games:
```bash
curl http://localhost:3001/api/v1/games
```

### Get leaderboard:
```bash
curl http://localhost:3001/api/v1/leaderboard
```

## Real-time Subscriptions

Supabase provides built-in real-time subscriptions:

### Subscribe to game updates:
```typescript
import { SupabaseService } from './services/supabase';

const supabase = SupabaseService.getInstance();

const channel = supabase.subscribeToGame('game-id', (payload) => {
  console.log('Game updated:', payload);
});

// Unsubscribe when done
supabase.unsubscribe(channel);
```

### Subscribe to player joins:
```typescript
const channel = supabase.subscribeToGamePlayers('game-id', (payload) => {
  console.log('Player joined/left:', payload);
});
```

## Row Level Security (RLS)

RLS is enabled by default. Policies are set up for:

### Public Read Access:
- Anyone can view users, games, transactions
- Anyone can view leaderboard

### Authenticated Write Access:
- Authenticated users can create games
- Authenticated users can join games
- Users can update their own profile

### Service Role Access:
- Service role can insert transactions
- Service role can update any data

## Database Functions

### Refresh Leaderboard:
```sql
SELECT refresh_leaderboard();
```

### Get User Stats:
```sql
SELECT * FROM get_user_stats('wallet-address');
```

## Monitoring

### Database Usage:
1. Go to **Settings** → **Usage**
2. Monitor:
   - Database size
   - API requests
   - Bandwidth
   - Storage

### Logs:
1. Go to **Logs**
2. View:
   - API logs
   - Database logs
   - Auth logs

## Backup & Recovery

### Automatic Backups:
- Free tier: Daily backups (7 days retention)
- Pro tier: Point-in-time recovery

### Manual Backup:
```bash
# Export database
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# Import database
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

## Performance Optimization

### Indexes:
All necessary indexes are created in schema.sql

### Materialized View:
Leaderboard is a materialized view for fast queries

### Refresh Leaderboard:
```typescript
await supabase.getAdminClient().rpc('refresh_leaderboard');
```

Run this:
- After each game finishes
- On a schedule (every 5 minutes)
- When leaderboard is requested

## Troubleshooting

### Connection Failed:
- Check SUPABASE_URL is correct
- Check API keys are correct
- Verify project is not paused

### RLS Blocking Queries:
- Use service role key for admin operations
- Check RLS policies in Table Editor

### Slow Queries:
- Check indexes are created
- Use EXPLAIN ANALYZE in SQL Editor
- Consider adding more indexes

### Real-time Not Working:
- Check Realtime is enabled in Settings
- Verify RLS policies allow reads
- Check channel subscription code

## Production Checklist

- [ ] Upgrade to Pro plan
- [ ] Enable Point-in-time Recovery
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Enable database backups
- [ ] Set up monitoring alerts
- [ ] Review RLS policies
- [ ] Optimize indexes
- [ ] Set up CDN for storage
- [ ] Configure rate limiting

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **SQL Reference**: https://supabase.com/docs/guides/database
- **Real-time**: https://supabase.com/docs/guides/realtime
- **RLS**: https://supabase.com/docs/guides/auth/row-level-security

## Support

- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase
- **Twitter**: @supabase

---

**Status**: ✅ Ready for Development  
**Last Updated**: February 22, 2025
