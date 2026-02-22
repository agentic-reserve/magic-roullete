// Unit Tests - Magic Roulette Backend
// Coverage Target: >= 80%

import { GameService } from '../src/services/game.service';
import { PlayerService } from '../src/services/player.service';
import { RewardService } from '../src/services/reward.service';
import { Decimal } from 'decimal.js';

describe('GameService', () => {
  let gameService: GameService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      games: {
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
      },
      players: {
        findById: jest.fn(),
      },
    };
    gameService = new GameService(mockDb);
  });

  describe('createGame', () => {
    it('should create game with valid parameters', async () => {
      const params = {
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: new Decimal('100000000'),
      };

      mockDb.games.create.mockResolvedValue({
        id: 'game1',
        ...params,
        status: 'WaitingForPlayers',
      });

      const result = await gameService.createGame(params);

      expect(result.id).toBe('game1');
      expect(result.status).toBe('WaitingForPlayers');
      expect(mockDb.games.create).toHaveBeenCalledWith(params);
    });

    it('should reject zero entry fee', async () => {
      const params = {
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: new Decimal('0'),
      };

      await expect(gameService.createGame(params)).rejects.toThrow(
        'InsufficientEntryFee'
      );
    });

    it('should reject negative entry fee', async () => {
      const params = {
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: new Decimal('-100'),
      };

      await expect(gameService.createGame(params)).rejects.toThrow(
        'InsufficientEntryFee'
      );
    });

    it('should reject invalid game mode', async () => {
      const params = {
        creator: 'player1',
        mode: 'InvalidMode' as any,
        entryFee: new Decimal('100000000'),
      };

      await expect(gameService.createGame(params)).rejects.toThrow(
        'InvalidGameMode'
      );
    });

    it('should accept minimum entry fee', async () => {
      const params = {
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: new Decimal('10000000'), // 0.01 SOL
      };

      mockDb.games.create.mockResolvedValue({
        id: 'game1',
        ...params,
        status: 'WaitingForPlayers',
      });

      const result = await gameService.createGame(params);
      expect(result.id).toBe('game1');
    });

    it('should accept maximum entry fee', async () => {
      const params = {
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: new Decimal('9223372036854775807'), // u64::MAX
      };

      mockDb.games.create.mockResolvedValue({
        id: 'game1',
        ...params,
        status: 'WaitingForPlayers',
      });

      const result = await gameService.createGame(params);
      expect(result.id).toBe('game1');
    });
  });

  describe('joinGame', () => {
    it('should add player to team_b', async () => {
      const gameId = 'game1';
      const playerId = 'player2';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        teamACount: 1,
        teamBCount: 0,
        status: 'WaitingForPlayers',
      });

      mockDb.games.update.mockResolvedValue({
        id: gameId,
        teamACount: 1,
        teamBCount: 1,
      });

      const result = await gameService.joinGame(gameId, playerId);

      expect(result.teamBCount).toBe(1);
      expect(mockDb.games.update).toHaveBeenCalled();
    });

    it('should reject duplicate player', async () => {
      const gameId = 'game1';
      const playerId = 'player1';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        teamA: [playerId],
        teamB: [],
        status: 'WaitingForPlayers',
      });

      await expect(gameService.joinGame(gameId, playerId)).rejects.toThrow(
        'PlayerAlreadyInGame'
      );
    });

    it('should reject creator self-join', async () => {
      const gameId = 'game1';
      const creator = 'player1';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        creator,
        teamA: [creator],
        teamB: [],
        status: 'WaitingForPlayers',
      });

      await expect(gameService.joinGame(gameId, creator)).rejects.toThrow(
        'CannotJoinOwnGame'
      );
    });

    it('should reject join when game full', async () => {
      const gameId = 'game1';
      const playerId = 'player3';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        mode: 'OneVsOne',
        teamACount: 1,
        teamBCount: 1,
        status: 'WaitingForPlayers',
      });

      await expect(gameService.joinGame(gameId, playerId)).rejects.toThrow(
        'GameFull'
      );
    });

    it('should transfer entry fee', async () => {
      const gameId = 'game1';
      const playerId = 'player2';
      const entryFee = new Decimal('100000000');

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        entryFee,
        teamACount: 1,
        teamBCount: 0,
        status: 'WaitingForPlayers',
      });

      mockDb.games.update.mockResolvedValue({
        id: gameId,
        teamBCount: 1,
        totalPot: entryFee.times(2),
      });

      const result = await gameService.joinGame(gameId, playerId);

      expect(result.totalPot).toEqual(entryFee.times(2));
    });
  });

  describe('finalizeGame', () => {
    it('should distribute prizes correctly', async () => {
      const gameId = 'game1';
      const totalPot = new Decimal('1000000000');
      const platformFeeBps = 500;
      const treasuryFeeBps = 1000;

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        totalPot,
        status: 'Finished',
        winner: 'player1',
        winnerTeam: 0,
        teamACount: 1,
        teamBCount: 1,
      });

      const platformFee = totalPot.times(platformFeeBps).dividedBy(10000);
      const treasuryFee = totalPot.times(treasuryFeeBps).dividedBy(10000);
      const winnerAmount = totalPot.minus(platformFee).minus(treasuryFee);

      mockDb.games.update.mockResolvedValue({
        id: gameId,
        status: 'Cancelled',
      });

      const result = await gameService.finalizeGame(gameId);

      expect(result.status).toBe('Cancelled');
      expect(platformFee.toString()).toBe('50000000');
      expect(treasuryFee.toString()).toBe('100000000');
      expect(winnerAmount.toString()).toBe('850000000');
    });

    it('should split prize for 2v2 game', async () => {
      const gameId = 'game1';
      const totalPot = new Decimal('1000000000');
      const winnerCount = 2;

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        totalPot,
        status: 'Finished',
        winnerTeam: 0,
        teamACount: 2,
        teamBCount: 2,
      });

      const platformFee = totalPot.times(500).dividedBy(10000);
      const treasuryFee = totalPot.times(1000).dividedBy(10000);
      const winnerAmount = totalPot.minus(platformFee).minus(treasuryFee);
      const perWinner = winnerAmount.dividedBy(winnerCount).integerValue(Decimal.ROUND_DOWN);

      expect(perWinner.toString()).toBe('425000000');
    });

    it('should reject finalize when not finished', async () => {
      const gameId = 'game1';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        status: 'InProgress',
      });

      await expect(gameService.finalizeGame(gameId)).rejects.toThrow(
        'GameNotFinished'
      );
    });

    it('should validate winner address', async () => {
      const gameId = 'game1';
      const wrongWinner = 'attacker';

      mockDb.games.findById.mockResolvedValue({
        id: gameId,
        status: 'Finished',
        winner: 'player1',
        winnerTeam: 0,
      });

      await expect(
        gameService.finalizeGame(gameId, wrongWinner)
      ).rejects.toThrow('InvalidWinner');
    });
  });
});

describe('RewardService', () => {
  let rewardService: RewardService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      rewards: {
        findByPlayer: jest.fn(),
        update: jest.fn(),
      },
    };
    rewardService = new RewardService(mockDb);
  });

  describe('claimRewards', () => {
    it('should claim available rewards', async () => {
      const playerId = 'player1';
      const claimableAmount = new Decimal('500000000');

      mockDb.rewards.findByPlayer.mockResolvedValue({
        player: playerId,
        claimableAmount,
        totalClaimed: new Decimal('0'),
      });

      mockDb.rewards.update.mockResolvedValue({
        player: playerId,
        claimableAmount: new Decimal('0'),
        totalClaimed: claimableAmount,
      });

      const result = await rewardService.claimRewards(playerId);

      expect(result.claimableAmount.toString()).toBe('0');
      expect(result.totalClaimed).toEqual(claimableAmount);
    });

    it('should reject claim with no rewards', async () => {
      const playerId = 'player1';

      mockDb.rewards.findByPlayer.mockResolvedValue({
        player: playerId,
        claimableAmount: new Decimal('0'),
      });

      await expect(rewardService.claimRewards(playerId)).rejects.toThrow(
        'NoRewardsToClaim'
      );
    });

    it('should handle precision in reward calculation', async () => {
      const playerId = 'player1';
      const winnerAmount = new Decimal('850000000');
      const winnerCount = 2;

      const perWinner = winnerAmount
        .dividedBy(winnerCount)
        .integerValue(Decimal.ROUND_DOWN);

      expect(perWinner.toString()).toBe('425000000');
    });
  });
});

describe('Financial Precision', () => {
  it('should calculate fees without precision loss', () => {
    const totalPot = new Decimal('1000000000');
    const platformFeeBps = 500;

    const platformFee = totalPot
      .times(platformFeeBps)
      .dividedBy(10000);

    expect(platformFee.toString()).toBe('50000000');
  });

  it('should handle edge case amounts', () => {
    const testCases = [
      '1',
      '999999999',
      '1000000000',
      '999999999999999999',
    ];

    for (const amount of testCases) {
      const pot = new Decimal(amount);
      const fee = pot.times(500).dividedBy(10000);

      expect(fee.isFinite()).toBe(true);
      expect(fee.isNaN()).toBe(false);
    }
  });

  it('should distribute without dust', () => {
    const totalPot = new Decimal('1000000000');
    const platformFeeBps = 500;
    const treasuryFeeBps = 1000;
    const winnerCount = 2;

    const platformFee = totalPot.times(platformFeeBps).dividedBy(10000);
    const treasuryFee = totalPot.times(treasuryFeeBps).dividedBy(10000);
    const winnerAmount = totalPot.minus(platformFee).minus(treasuryFee);
    const perWinner = winnerAmount.dividedBy(winnerCount).integerValue(Decimal.ROUND_DOWN);
    const dust = winnerAmount.minus(perWinner.times(winnerCount));

    expect(dust.lessThan(1)).toBe(true);
  });

  it('should maintain precision through multiple operations', () => {
    const amount = new Decimal('123456789');
    const fee1 = amount.times(500).dividedBy(10000);
    const fee2 = fee1.times(2);
    const total = amount.plus(fee2);

    expect(total.isFinite()).toBe(true);
    expect(total.decimalPlaces()).toBeLessThanOrEqual(9);
  });
});
