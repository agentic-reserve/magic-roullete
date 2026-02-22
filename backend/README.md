# Magic Roulette Backend API

Complete backend API for Magic Roulette - Solana's most degenerate on-chain roulette game.

## Features

✅ **RESTful API** - Complete CRUD operations for games, users, transactions  
✅ **WebSocket Server** - Real-time game updates and notifications  
✅ **PostgreSQL Database** - Prisma ORM for type-safe database access  
✅ **Redis Caching** - Fast data access and pub/sub messaging  
✅ **Solana Integration** - Direct blockchain interaction via Helius  
✅ **JWT Authentication** - Secure user sessions  
✅ **Rate Limiting** - DDoS protection  
✅ **Admin Dashboard** - Game management and analytics  
✅ **Leaderboard System** - Real-time rankings  
✅ **Transaction Tracking** - Complete audit trail  

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: Prisma
- **Blockchain**: Solana (via @solana/web3.js + Helius SDK)
- **WebSocket**: ws
- **Authentication**: JWT
- **Validation**: Zod

## Quick Start

### Prerequisites

```bash
# Install Node.js 20+
node --version

# Install PostgreSQL 15+
psql --version

# Install Redis 7+
redis-cli --version
```

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Open Prisma Studio (optional)
npm run db:studio
```

### Start Development Server

```bash
# Start with hot reload
npm run dev

# Server will start on http://localhost:3001
```

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/magic_roulette

# Redis
REDIS_URL=redis://localhost:6379

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_API_KEY=your-helius-api-key
PROGRAM_ID=JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin
ADMIN_WALLET_ADDRESS=your-admin-wallet
```

## API Endpoints

### Games

```
GET    /api/v1/games              # List all games
GET    /api/v1/games/:id          # Get game details
GET    /api/v1/games/:id/players  # Get game players
POST   /api/v1/games              # Create new game (auth)
POST   /api/v1/games/:id/join     # Join game (auth)
POST   /api/v1/games/:id/leave    # Leave game (auth)
GET    /api/v1/games/user/:wallet # Get user's games
```

### Users

```
GET    /api/v1/users/:wallet      # Get user profile
GET    /api/v1/users/:wallet/stats # Get user stats
POST   /api/v1/users/auth/login   # Login
POST   /api/v1/users/auth/logout  # Logout (auth)
PUT    /api/v1/users/profile      # Update profile (auth)
```

### Leaderboard

```
GET    /api/v1/leaderboard        # Get leaderboard
GET    /api/v1/leaderboard/top/:n # Get top N players
```

### Transactions

```
GET    /api/v1/transactions       # List transactions
GET    /api/v1/transactions/:sig  # Get transaction
GET    /api/v1/transactions/user/:wallet # User transactions
```

### Stats

```
GET    /api/v1/stats              # Global stats
GET    /api/v1/stats/daily        # Daily stats
```

### Admin

```
GET    /api/v1/admin/dashboard    # Admin dashboard (auth)
GET    /api/v1/admin/users        # List users (auth)
GET    /api/v1/admin/games        # List games (auth)
POST   /api/v1/admin/games/:id/cancel # Cancel game (auth)
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message:', data);
};
```

### Subscribe to Game

```javascript
ws.send(JSON.stringify({
  type: 'subscribe_game',
  gameId: 'game-id-here'
}));
```

### Unsubscribe from Game

```javascript
ws.send(JSON.stringify({
  type: 'unsubscribe_game',
  gameId: 'game-id-here'
}));
```

### Ping/Pong

```javascript
ws.send(JSON.stringify({
  type: 'ping'
}));

// Response: { type: 'pong', timestamp: 1234567890 }
```

### Game Updates

```javascript
// Automatic updates when subscribed
{
  type: 'game_update',
  gameId: 'game-id',
  data: {
    type: 'player_joined',
    game: { /* game data */ }
  },
  timestamp: 1234567890
}
```

## Database Schema

### User
- Wallet address, username, email
- Stats: games played, won, lost
- Total wagered, total winnings
- Level, experience, badges

### Game
- Game ID, on-chain address
- Mode, entry fee, status
- Current chamber, bullet chamber
- Kamino loan details
- Players, winners

### Transaction
- Signature, type, amount
- Status, block time, slot
- User and game relations

### Badge
- Name, description, icon
- Rarity, requirements

### Leaderboard
- Rankings by winnings, win rate
- Updated in real-time

## Architecture

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/               # API routes
│   │   ├── index.ts
│   │   ├── games.ts
│   │   ├── users.ts
│   │   ├── leaderboard.ts
│   │   ├── transactions.ts
│   │   ├── stats.ts
│   │   └── admin.ts
│   ├── controllers/          # Request handlers
│   │   ├── game.controller.ts
│   │   ├── user.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── stats.controller.ts
│   │   └── admin.controller.ts
│   ├── services/             # Business logic
│   │   ├── solana.ts
│   │   ├── redis.ts
│   │   └── websocket.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   ├── error-handler.ts
│   │   └── not-found.ts
│   └── validators/           # Zod schemas
│       └── game.validator.ts
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database Migrations

```bash
# Create migration
npm run db:migrate

# Reset database
npx prisma migrate reset

# Seed database (if seed file exists)
npx prisma db seed
```

### Prisma Studio

```bash
# Open database GUI
npm run db:studio
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: magic_roulette
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Database backups
- [ ] Redis persistence
- [ ] Load balancing
- [ ] CDN for static assets

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-02-22T00:00:00.000Z",
  "uptime": 12345,
  "version": "v1"
}
```

### Metrics

- Active connections
- Request rate
- Response time
- Error rate
- Database queries
- Cache hit rate

## Security

### Authentication

- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Session management
- Token refresh

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable limits
- Redis-based tracking

### Input Validation

- Zod schema validation
- SQL injection prevention (Prisma)
- XSS protection (helmet)

### CORS

- Whitelist origins
- Credentials support
- Preflight caching

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Redis Connection Failed

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npm run db:generate
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: February 22, 2025
