/**
 * Supabase Service
 * 
 * Handles all Supabase database and auth interactions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Client for public operations
    this.client = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for privileged operations
    this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase clients initialized');
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  public getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  public async getUser(walletAddress: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  public async createUser(walletAddress: string, username?: string) {
    const { data, error } = await this.adminClient
      .from('users')
      .insert({
        wallet_address: walletAddress,
        username,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async updateUser(id: string, updates: any) {
    const { data, error } = await this.adminClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getUserStats(walletAddress: string) {
    const { data, error } = await this.client
      .rpc('get_user_stats', { wallet: walletAddress });

    if (error) throw error;
    return data[0];
  }

  // ============================================================================
  // GAME OPERATIONS
  // ============================================================================

  public async getGames(filters: any = {}, page: number = 1, limit: number = 20) {
    let query = this.client
      .from('games')
      .select(`
        *,
        game_players (
          *,
          users (
            wallet_address,
            username,
            avatar,
            level
          )
        )
      `, { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      games: data,
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  }

  public async getGame(id: string) {
    const { data, error } = await this.client
      .from('games')
      .select(`
        *,
        game_players (
          *,
          users (
            wallet_address,
            username,
            avatar,
            level
          )
        ),
        transactions (
          *
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  public async createGame(gameData: any) {
    const { data, error } = await this.adminClient
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async updateGame(id: string, updates: any) {
    const { data, error } = await this.adminClient
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getActiveGamesCount() {
    const { count, error } = await this.client
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'IN_PROGRESS');

    if (error) throw error;
    return count || 0;
  }

  // ============================================================================
  // GAME PLAYER OPERATIONS
  // ============================================================================

  public async addPlayerToGame(gameId: string, userId: string, team: number, position: number) {
    const { data, error } = await this.adminClient
      .from('game_players')
      .insert({
        game_id: gameId,
        user_id: userId,
        team,
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async removePlayerFromGame(gameId: string, userId: string) {
    const { error } = await this.adminClient
      .from('game_players')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  public async getGamePlayers(gameId: string) {
    const { data, error } = await this.client
      .from('game_players')
      .select(`
        *,
        users (
          wallet_address,
          username,
          avatar,
          level,
          total_games,
          games_won
        )
      `)
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // TRANSACTION OPERATIONS
  // ============================================================================

  public async createTransaction(txData: any) {
    const { data, error } = await this.adminClient
      .from('transactions')
      .insert(txData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async updateTransaction(signature: string, updates: any) {
    const { data, error } = await this.adminClient
      .from('transactions')
      .update(updates)
      .eq('signature', signature)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getTransaction(signature: string) {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('signature', signature)
      .single();

    if (error) throw error;
    return data;
  }

  public async getUserTransactions(walletAddress: string, page: number = 1, limit: number = 10) {
    // First get user
    const user = await this.getUser(walletAddress);
    if (!user) throw new Error('User not found');

    const { data, error, count } = await this.client
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      transactions: data,
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  }

  // ============================================================================
  // LEADERBOARD OPERATIONS
  // ============================================================================

  public async getLeaderboard(page: number = 1, limit: number = 100) {
    const { data, error, count } = await this.client
      .from('leaderboard')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      leaderboard: data,
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    };
  }

  public async refreshLeaderboard() {
    const { error } = await this.adminClient.rpc('refresh_leaderboard');
    if (error) throw error;
  }

  // ============================================================================
  // BADGE OPERATIONS
  // ============================================================================

  public async getBadges() {
    const { data, error } = await this.client
      .from('badges')
      .select('*')
      .order('rarity', { ascending: true });

    if (error) throw error;
    return data;
  }

  public async getUserBadges(userId: string) {
    const { data, error } = await this.client
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  public async awardBadge(userId: string, badgeId: string) {
    const { data, error } = await this.adminClient
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  public subscribeToGame(gameId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        callback
      )
      .subscribe();
  }

  public subscribeToGamePlayers(gameId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`game_players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`,
        },
        callback
      )
      .subscribe();
  }

  public unsubscribe(channel: any) {
    return this.client.removeChannel(channel);
  }
}
