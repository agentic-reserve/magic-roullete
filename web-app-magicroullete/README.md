# Magic Roulette Web App

Web-based Magic Roulette game with MagicBlock Ephemeral Rollups integration for ultra-fast, gasless gameplay.

## 🚀 Features

- **Wallet Connection**: Connect with any Solana wallet (Phantom, Solflare, etc.)
- **MagicBlock Integration**: Sub-10ms latency gameplay with Ephemeral Rollups
- **Kamino Finance**: Lending and yield features (Phase 2)
- **Real-time Updates**: WebSocket support for live game state
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Solana**: @solana/react-hooks, @solana/client
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
```

## 🔧 Configuration

Edit `.env.local` with your settings:

```env
# Solana RPC (use Helius for better performance)
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Magic Roulette Program ID
NEXT_PUBLIC_PROGRAM_ID=HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam

# MagicBlock ER
NEXT_PUBLIC_MAGICBLOCK_ER_RPC_URL=https://devnet-eu.magicblock.app
NEXT_PUBLIC_MAGICBLOCK_ER_VALIDATOR=MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e
```

## 🏃 Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
web-app-magicroullete/
├── app/
│   ├── components/       # React components
│   │   └── providers.tsx # Solana provider setup
│   ├── lib/             # Utilities and helpers
│   │   ├── config.ts    # App configuration
│   │   └── magicblock.ts # MagicBlock utilities
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── .env.local           # Environment variables (not committed)
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## 🎮 Game Flow

1. **Connect Wallet**: User connects Solana wallet
2. **Create/Join Game**: Create new game or join existing
3. **Delegation**: Game delegated to Ephemeral Rollup
4. **Gameplay**: Take shots with sub-10ms latency (gasless)
5. **Finalization**: Winner claims prize, game undelegated

## 🔗 Integration Points

### MagicBlock Ephemeral Rollups

- **Delegation**: Games delegated for fast execution
- **Gasless Transactions**: Join and play without gas fees
- **Sub-10ms Latency**: Ultra-fast game actions
- **Auto-commit**: State synced to base layer

### Kamino Finance (Phase 2)

- **Yield Vaults**: Earn while playing
- **Lending**: Borrow for betting
- **Treasury**: Platform fees earn yield

### Ephemeral VRF (Phase 2)

- **Provably Fair**: Verifiable randomness
- **On-chain Proofs**: Transparent results

## 🧪 Testing

```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📚 Resources

- [Solana Docs](https://solana.com/docs)
- [MagicBlock Docs](https://docs.magicblock.gg/)
- [Kamino Finance](https://kamino.finance/)
- [@solana/react-hooks](https://github.com/solana-foundation/framework-kit/tree/main/packages/react-hooks)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Discord: [MagicBlock Community](https://discord.com/invite/MBkdC3gxcv)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
