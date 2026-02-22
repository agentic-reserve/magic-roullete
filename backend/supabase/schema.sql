-- Magic Roulette Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE game_mode AS ENUM ('ONE_VS_ONE', 'TWO_VS_TWO', 'PRACTICE');
CREATE TYPE game_status AS ENUM ('WAITING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM ('GAME_ENTRY', 'GAME_PAYOUT', 'LOAN_BORROW', 'LOAN_REPAY', 'FEE_PAYMENT');
CREATE TYPE tx_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
CREATE TYPE rarity AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar TEXT,
  
  -- Stats
  total_games INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  total_wagered DECIMAL(20, 9) DEFAULT 0,
  total_winnings DECIMAL(20, 9) DEFAULT 0,
  
  -- Achievements
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id BIGINT UNIQUE NOT NULL,
  on_chain_address TEXT UNIQUE NOT NULL,
  
  -- Game details
  mode game_mode NOT NULL,
  entry_fee DECIMAL(20, 9) NOT NULL,
  status game_status DEFAULT 'WAITING',
  current_chamber INTEGER DEFAULT 1,
  bullet_chamber INTEGER,
  
  -- Kamino integration
  has_loan BOOLEAN DEFAULT FALSE,
  loan_amount DECIMAL(20, 9),
  collateral_amount DECIMAL(20, 9),
  
  -- Players
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  
  -- Results
  winner_team INTEGER,
  winners TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Game players junction table
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  team INTEGER NOT NULL,
  position INTEGER NOT NULL,
  is_alive BOOLEAN DEFAULT TRUE,
  shots_taken INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_id, user_id)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signature TEXT UNIQUE NOT NULL,
  
  -- Transaction details
  type transaction_type NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  status tx_status DEFAULT 'PENDING',
  
  -- Relations
  user_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  
  -- Metadata
  block_time TIMESTAMPTZ,
  slot BIGINT,
  error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity rarity NOT NULL,
  requirement TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- Leaderboard materialized view
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.id,
  u.wallet_address,
  u.username,
  u.total_games,
  u.games_won,
  CASE 
    WHEN u.total_games > 0 THEN (u.games_won::DECIMAL / u.total_games::DECIMAL * 100)
    ELSE 0 
  END as win_rate,
  u.total_winnings,
  ROW_NUMBER() OVER (ORDER BY u.total_winnings DESC) as rank
FROM users u
WHERE u.total_games > 0
ORDER BY u.total_winnings DESC;

-- Create indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_games_game_id ON games(game_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_game_id ON transactions(game_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- Create unique index on leaderboard
CREATE UNIQUE INDEX idx_leaderboard_id ON leaderboard(id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_winnings ON leaderboard(total_winnings);
CREATE INDEX idx_leaderboard_win_rate ON leaderboard(win_rate);

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'FINISHED' AND OLD.status != 'FINISHED' THEN
    -- Update stats for all players in the game
    UPDATE users u
    SET 
      total_games = total_games + 1,
      games_won = games_won + CASE 
        WHEN gp.team = NEW.winner_team THEN 1 
        ELSE 0 
      END,
      games_lost = games_lost + CASE 
        WHEN gp.team != NEW.winner_team THEN 1 
        ELSE 0 
      END,
      updated_at = NOW()
    FROM game_players gp
    WHERE gp.game_id = NEW.id AND gp.user_id = u.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when game finishes
CREATE TRIGGER trigger_update_user_stats
AFTER UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users are viewable by everyone" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- RLS Policies for games
CREATE POLICY "Games are viewable by everyone" 
  ON games FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create games" 
  ON games FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for game_players
CREATE POLICY "Game players are viewable by everyone" 
  ON game_players FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can join games" 
  ON game_players FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for transactions
CREATE POLICY "Transactions are viewable by everyone" 
  ON transactions FOR SELECT 
  USING (true);

CREATE POLICY "Service role can insert transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone" 
  ON badges FOR SELECT 
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "User badges are viewable by everyone" 
  ON user_badges FOR SELECT 
  USING (true);

-- Insert some default badges
INSERT INTO badges (name, description, icon, rarity, requirement) VALUES
  ('First Blood', 'Win your first game', '🎯', 'COMMON', 'Win 1 game'),
  ('Lucky Streak', 'Win 5 games in a row', '🍀', 'RARE', 'Win 5 consecutive games'),
  ('High Roller', 'Wager over 100 SOL total', '💎', 'EPIC', 'Total wagered > 100 SOL'),
  ('Legendary Survivor', 'Win 100 games', '👑', 'LEGENDARY', 'Win 100 games'),
  ('Degen King', 'Reach top 10 on leaderboard', '🔥', 'LEGENDARY', 'Rank <= 10');

-- Create a function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(wallet TEXT)
RETURNS TABLE (
  total_games INTEGER,
  games_won INTEGER,
  games_lost INTEGER,
  win_rate DECIMAL,
  total_wagered DECIMAL,
  total_winnings DECIMAL,
  level INTEGER,
  experience INTEGER,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.total_games,
    u.games_won,
    u.games_lost,
    CASE 
      WHEN u.total_games > 0 THEN (u.games_won::DECIMAL / u.total_games::DECIMAL * 100)
      ELSE 0 
    END as win_rate,
    u.total_wagered,
    u.total_winnings,
    u.level,
    u.experience,
    COALESCE(l.rank::INTEGER, 0) as rank
  FROM users u
  LEFT JOIN leaderboard l ON l.id = u.id
  WHERE u.wallet_address = wallet;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh leaderboard initially
SELECT refresh_leaderboard();
