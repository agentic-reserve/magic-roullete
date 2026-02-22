// E2E Tests - Magic Roulette Backend
// Main flow testing

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Game API E2E', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    req = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /games - Create Game', () => {
    it('should create game with valid parameters', async () => {
      const response = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        })
        .expect(201);

      expect(response.body).toHaveProperty('gameId');
      expect(response.body.status).toBe('WaitingForPlayers');
      expect(response.body.teamACount).toBe(1);
      expect(response.body.teamBCount).toBe(0);
    });

    it('should reject zero entry fee', async () => {
      await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '0',
        })
        .expect(400);
    });

    it('should reject invalid game mode', async () => {
      await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'InvalidMode',
          entryFee: '100000000',
        })
        .expect(400);
    });
  });

  describe('POST /games/:id/join - Join Game', () => {
    let gameId: string;

    beforeAll(async () => {
      const response = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = response.body.gameId;
    });

    it('should add player to team_b', async () => {
      const response = await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' })
        .expect(200);

      expect(response.body.teamBCount).toBe(1);
      expect(response.body.totalPot).toBe('200000000');
    });

    it('should reject duplicate player', async () => {
      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' })
        .expect(400);
    });

    it('should reject creator self-join', async () => {
      const newGameResponse = await req
        .post('/games')
        .send({
          creator: 'player3',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      const newGameId = newGameResponse.body.gameId;

      await req
        .post(`/games/${newGameId}/join`)
        .send({ player: 'player3' })
        .expect(400);
    });
  });

  describe('GET /games/:id - Get Game State', () => {
    let gameId: string;

    beforeAll(async () => {
      const response = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = response.body.gameId;
    });

    it('should return game state', async () => {
      const response = await req
        .get(`/games/${gameId}`)
        .expect(200);

      expect(response.body.id).toBe(gameId);
      expect(response.body.status).toBe('WaitingForPlayers');
      expect(response.body.entryFee).toBe('100000000');
    });

    it('should return 404 for non-existent game', async () => {
      await req
        .get('/games/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /games/:id/delegate - Delegate Game', () => {
    let gameId: string;

    beforeAll(async () => {
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = gameResponse.body.gameId;

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' });
    });

    it('should delegate game to ER', async () => {
      const response = await req
        .post(`/games/${gameId}/delegate`)
        .expect(200);

      expect(response.body.status).toBe('Delegated');
    });

    it('should reject delegate when not full', async () => {
      const newGameResponse = await req
        .post('/games')
        .send({
          creator: 'player3',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      const newGameId = newGameResponse.body.gameId;

      await req
        .post(`/games/${newGameId}/delegate`)
        .expect(400);
    });
  });

  describe('POST /games/:id/vrf - Process VRF', () => {
    let gameId: string;

    beforeAll(async () => {
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = gameResponse.body.gameId;

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' });

      await req
        .post(`/games/${gameId}/delegate`);
    });

    it('should process VRF result', async () => {
      const response = await req
        .post(`/games/${gameId}/vrf`)
        .send({
          randomness: Buffer.from([42, 42, 42, 42, 42, 42, 42, 42]).toString('hex'),
        })
        .expect(200);

      expect(response.body.status).toBe('InProgress');
      expect(response.body.bulletChamber).toBeGreaterThanOrEqual(1);
      expect(response.body.bulletChamber).toBeLessThanOrEqual(6);
    });
  });

  describe('POST /games/:id/shot - Take Shot', () => {
    let gameId: string;

    beforeAll(async () => {
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = gameResponse.body.gameId;

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' });

      await req
        .post(`/games/${gameId}/delegate`);

      await req
        .post(`/games/${gameId}/vrf`)
        .send({
          randomness: Buffer.from([42, 42, 42, 42, 42, 42, 42, 42]).toString('hex'),
        });
    });

    it('should process shot', async () => {
      const response = await req
        .post(`/games/${gameId}/shot`)
        .send({ player: 'player1' })
        .expect(200);

      expect(response.body.shotsTaken).toBeGreaterThan(0);
    });

    it('should reject shot from wrong player', async () => {
      await req
        .post(`/games/${gameId}/shot`)
        .send({ player: 'player3' })
        .expect(400);
    });
  });

  describe('POST /games/:id/finalize - Finalize Game', () => {
    let gameId: string;

    beforeAll(async () => {
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      gameId = gameResponse.body.gameId;

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'player2' });

      await req
        .post(`/games/${gameId}/delegate`);

      await req
        .post(`/games/${gameId}/vrf`)
        .send({
          randomness: Buffer.from([42, 42, 42, 42, 42, 42, 42, 42]).toString('hex'),
        });

      // Simulate game completion
      await req
        .post(`/games/${gameId}/shot`)
        .send({ player: 'player1' });
    });

    it('should finalize game and distribute prizes', async () => {
      const response = await req
        .post(`/games/${gameId}/finalize`)
        .expect(200);

      expect(response.body.status).toBe('Cancelled');
      expect(response.body.winner).toBeDefined();
    });

    it('should reject finalize when not finished', async () => {
      const newGameResponse = await req
        .post('/games')
        .send({
          creator: 'player3',
          mode: 'OneVsOne',
          entryFee: '100000000',
        });

      const newGameId = newGameResponse.body.gameId;

      await req
        .post(`/games/${newGameId}/finalize`)
        .expect(400);
    });
  });

  describe('GET /players/:id/rewards - Get Rewards', () => {
    it('should return player rewards', async () => {
      const response = await req
        .get('/players/player1/rewards')
        .expect(200);

      expect(response.body).toHaveProperty('claimableAmount');
      expect(response.body).toHaveProperty('totalClaimed');
    });
  });

  describe('POST /rewards/claim - Claim Rewards', () => {
    it('should claim available rewards', async () => {
      const response = await req
        .post('/rewards/claim')
        .send({ player: 'player1' })
        .expect(200);

      expect(response.body).toHaveProperty('claimedAmount');
      expect(response.body.claimableAmount).toBe('0');
    });

    it('should reject claim with no rewards', async () => {
      await req
        .post('/rewards/claim')
        .send({ player: 'player-no-rewards' })
        .expect(400);
    });
  });

  describe('Complete Game Flow', () => {
    it('should complete full 1v1 game flow', async () => {
      // 1. Create game
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'flow-player1',
          mode: 'OneVsOne',
          entryFee: '100000000',
        })
        .expect(201);

      const gameId = gameResponse.body.gameId;

      // 2. Join game
      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'flow-player2' })
        .expect(200);

      // 3. Delegate
      await req
        .post(`/games/${gameId}/delegate`)
        .expect(200);

      // 4. Process VRF
      await req
        .post(`/games/${gameId}/vrf`)
        .send({
          randomness: Buffer.from([42, 42, 42, 42, 42, 42, 42, 42]).toString('hex'),
        })
        .expect(200);

      // 5. Take shots
      await req
        .post(`/games/${gameId}/shot`)
        .send({ player: 'flow-player1' })
        .expect(200);

      // 6. Finalize
      const finalResponse = await req
        .post(`/games/${gameId}/finalize`)
        .expect(200);

      expect(finalResponse.body.status).toBe('Cancelled');
      expect(finalResponse.body.winner).toBeDefined();
    });

    it('should complete full 2v2 game flow', async () => {
      // 1. Create game
      const gameResponse = await req
        .post('/games')
        .send({
          creator: 'team-player1',
          mode: 'TwoVsTwo',
          entryFee: '100000000',
        })
        .expect(201);

      const gameId = gameResponse.body.gameId;

      // 2. Join players
      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'team-player2' })
        .expect(200);

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'team-player3' })
        .expect(200);

      await req
        .post(`/games/${gameId}/join`)
        .send({ player: 'team-player4' })
        .expect(200);

      // 3. Delegate
      await req
        .post(`/games/${gameId}/delegate`)
        .expect(200);

      // 4. Process VRF
      await req
        .post(`/games/${gameId}/vrf`)
        .send({
          randomness: Buffer.from([42, 42, 42, 42, 42, 42, 42, 42]).toString('hex'),
        })
        .expect(200);

      // 5. Finalize
      const finalResponse = await req
        .post(`/games/${gameId}/finalize`)
        .expect(200);

      expect(finalResponse.body.status).toBe('Cancelled');
      expect(finalResponse.body.winner).toBeDefined();
    });
  });
});
