# Magic Roulette Monitoring & Analytics

Comprehensive monitoring and analytics system using Helius Enhanced Transaction API.

## Features

- **Real-time Monitoring**: Track all platform transactions in real-time
- **Player Analytics**: Detailed player statistics and history
- **Anomaly Detection**: Automatic detection of suspicious activity
- **Treasury Tracking**: Monitor treasury balance and distributions
- **Leaderboards**: Track top players and winners
- **Custom Reports**: Generate detailed analytics reports

## Setup

### 1. Install Dependencies

```bash
cd monitoring
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Helius API key
```

```env
HELIUS_API_KEY=your-helius-api-key
PROGRAM_ID=MRou1etteGameFi11111111111111111111111111111
PLATFORM_CONFIG=YourPlatformConfigAddress
CLUSTER=devnet
```

### 3. Run Monitoring

```bash
# Start real-time monitoring
npm run monitor

# Generate analytics report
npm run report
```

## Usage

### Helius Integration

```typescript
import { HeliusMonitor } from "./helius-integration";

const monitor = new HeliusMonitor({
  apiKey: "your-helius-api-key",
  cluster: "devnet",
});

// Get all platform games
const games = await monitor.monitorPlatformGames(platformConfigAddress);

// Get player history
const history = await monitor.getPlayerGameHistory(playerAddress);

// Get failed transactions for debugging
const failed = await monitor.getFailedTransactions(platformAddress);

// Detect anomalies
const anomalies = await monitor.detectAnomalies(platformAddress);
```

### Analytics Dashboard

```typescript
import { AnalyticsDashboard } from "./analytics-dashboard";

const dashboard = new AnalyticsDashboard(
  "your-helius-api-key",
  "MRou1etteGameFi11111111111111111111111111111",
  "devnet"
);

// Get platform metrics
const metrics = await dashboard.getPlatformMetrics(platformConfigAddress);

// Get player metrics
const playerMetrics = await dashboard.getPlayerMetrics(playerAddress);

// Monitor active games
const monitoring = await dashboard.monitorActiveGames(platformAddress);

// Generate report
const report = await dashboard.generateReport(platformAddress, {
  start: Math.floor(Date.now() / 1000) - 86400,
  end: Math.floor(Date.now() / 1000),
});
```

## API Reference

### HeliusMonitor

#### `getTransactionsForAddress(query)`
Get transactions with advanced filtering.

**Parameters**:
- `address`: Solana address to query
- `transactionDetails`: "signatures" | "full"
- `sortOrder`: "asc" | "desc"
- `limit`: 1-1000 for signatures, 1-100 for full
- `filters`: Advanced filters (slot, time, status, etc.)

#### `monitorPlatformGames(platformAddress, options)`
Monitor all games for a platform.

#### `getPlayerGameHistory(playerAddress, limit)`
Get game history for a player.

#### `getFailedTransactions(address, timeRange)`
Get failed transactions for debugging.

#### `detectAnomalies(platformAddress, timeWindow)`
Detect suspicious activity.

### AnalyticsDashboard

#### `getPlatformMetrics(platformAddress, timeRange)`
Get platform-wide metrics.

**Returns**:
```typescript
{
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalVolume: number;
  totalPlayers: number;
  averageGameDuration: number;
  successRate: number;
}
```

#### `getPlayerMetrics(playerAddress)`
Get player-specific metrics.

**Returns**:
```typescript
{
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalWagered: number;
  totalWinnings: number;
  netProfit: number;
  averageBet: number;
}
```

#### `monitorActiveGames(platformAddress)`
Get real-time game monitoring.

**Returns**:
```typescript
{
  activeGames: number;
  recentActivity: TransactionSignature[];
  alerts: string[];
}
```

## Monitoring Scripts

### Real-time Monitor

```bash
npm run monitor
```

Continuously monitors platform for:
- New games created
- Games completed
- Failed transactions
- Suspicious activity
- High failure rates
- Unusual volume

### Generate Report

```bash
npm run report
```

Generates comprehensive analytics report:
- Platform metrics
- Top players
- Treasury analytics
- Anomaly detection
- Time-series data

## Anomaly Detection

The system automatically detects:

1. **High Failure Rate**: >30% transaction failures
2. **Unusual Volume**: 3x normal transaction volume
3. **Rapid-fire Transactions**: <1 second between transactions
4. **Suspicious Patterns**: Bot-like behavior

### Example Alert

```
⚠️ Anomalies Detected:
- High failure rate: 45.23%
- Unusual volume: 1,234 transactions in 300s
- Rapid-fire transactions detected
```

## Advanced Filtering

### Time Range Queries

```typescript
// Last 24 hours
const transactions = await monitor.getTransactionsByTimeRange(
  address,
  Math.floor(Date.now() / 1000) - 86400,
  Math.floor(Date.now() / 1000)
);
```

### Slot Range Queries

```typescript
// Specific slot range
const transactions = await monitor.getTransactionsBySlotRange(
  address,
  1000,
  2000
);
```

### Status Filtering

```typescript
// Only successful transactions
const successful = await monitor.getTransactionsForAddress({
  address,
  filters: {
    status: "succeeded",
  },
});

// Only failed transactions
const failed = await monitor.getTransactionsForAddress({
  address,
  filters: {
    status: "failed",
  },
});
```

### Pagination

```typescript
// Paginate through all transactions
for await (const batch of monitor.paginateTransactions(address)) {
  console.log("Batch:", batch.length);
  // Process batch
}
```

## Integration with Frontend

### Real-time Updates

```typescript
// In your React component
useEffect(() => {
  const interval = setInterval(async () => {
    const monitoring = await dashboard.monitorActiveGames(platformAddress);
    setActiveGames(monitoring.activeGames);
    setAlerts(monitoring.alerts);
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}, []);
```

### Player Dashboard

```typescript
// Show player stats
const metrics = await dashboard.getPlayerMetrics(wallet.publicKey.toBase58());

return (
  <div>
    <h2>Your Stats</h2>
    <p>Games Played: {metrics.gamesPlayed}</p>
    <p>Win Rate: {(metrics.winRate * 100).toFixed(2)}%</p>
    <p>Net Profit: {metrics.netProfit} tokens</p>
  </div>
);
```

## Performance

- **Signatures Query**: Up to 1,000 transactions per request
- **Full Details Query**: Up to 100 transactions per request
- **Pagination**: Efficient keyset-based pagination
- **Rate Limits**: Depends on Helius plan

## Best Practices

1. **Use Signatures First**: Query signatures first, then fetch full details only when needed
2. **Implement Caching**: Cache frequently accessed data
3. **Batch Requests**: Use pagination to fetch large datasets
4. **Monitor Rate Limits**: Track API usage
5. **Handle Errors**: Implement retry logic for failed requests

## Troubleshooting

### High API Usage

- Increase polling intervals
- Implement caching
- Use webhooks instead of polling (if available)

### Missing Transactions

- Check commitment level (use "finalized" for confirmed data)
- Verify address is correct
- Check time range filters

### Slow Queries

- Reduce limit per request
- Use more specific filters
- Implement pagination

## Support

- Helius Docs: https://docs.helius.dev
- Discord: https://discord.gg/helius
- Email: support@helius.dev
