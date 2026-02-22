# Phase 2: Web2 Backend Testing - Detailed Execution Plan

## Overview
Backend API testing for Magic Roulette using Jest, Supertest, and Schemathesis.

**Framework**: Jest 29.7.0  
**Test Runner**: ts-jest  
**Target Coverage**: >= 80%  
**Location**: `backend/tests/unit.test.ts`, `backend/tests/e2e.test.ts`

---

## 1. Unit Tests (Target: >= 80% Coverage)

### 1.1 GameService Tests

#### Test: Create Game with Valid Parameters
```typescript
Test Case:
- Creator: 'player1'
- Mode: 'OneVsOne'
- Entry Fee: 100,000,000 lamports
- Expected: Game created successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Reject Zero Entry Fee
```typescript
Test Case:
- Entry Fee: 0
- Expected: Error thrown

Expected Result: FAIL (rejected)
Actual Result: ⏳ PENDING
```

#### Test: Reject Negative Entry Fee
```typescript
Test Case:
- Entry Fee: -1,000,000
- Expected: Error thrown

Expected Result: FAIL (rejected)
Actual Result: ⏳ PENDING
```

#### Test: Reject Invalid Game Mode
```typescript
Test Case:
- Mode: 'InvalidMode'
- Expected: Error thrown

Expected Result: FAIL (rejected)
Actual Result: ⏳ PENDING
```

#### Test: Accept Minimum Entry Fee
```typescript
Test Case:
- Entry Fee: 1 lamport
- Expected: Game created successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Accept Maximum Entry Fee
```typescript
Test Case:
- Entry Fee: u64::MAX
- Expected: Game created successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Join Game - Add to Team B
```typescript
Test Case:
- Game created by Player 1 (Team A)
- Player 2 joins
- Expected: Player 2 added to Team B

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Join Game - Reject Duplicate
```typescript
Test Case:
- Player 1 joins game
- Player 1 attempts to join same game again
- Expected: Error thrown

Expected Result: FAIL (duplicate)
Actual Result: ⏳ PENDING
```

#### Test: Join Game - Reject Creator Self-Join
```typescript
Test Case:
- Player 1 creates game
- Player 1 attempts to join own game
- Expected: Error thrown

Expected Result: FAIL (self-join)
Actual Result: ⏳ PENDING
```

#### Test: Join Game - Reject When Full
```typescript
Test Case:
- 1v1 game with 2 players
- Player 3 attempts to join
- Expected: Error thrown

Expected Result: FAIL (full)
Actual Result: ⏳ PENDING
```

#### Test: Join Game - Transfer Entry Fee
```typescript
Test Case:
- Player joins game
- Entry fee transferred
- Expected: Fee deducted from player account

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Finalize Game - Distribute Prizes
```typescript
Test Case:
- Game completed
- Finalize called
- Expected: Prizes distributed to winners

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Finalize Game - Split Prize for 2v2
```typescript
Test Case:
- 2v2 game completed
- Finalize called
- Expected: Prize split between 2 winners

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Finalize Game - Reject When Not Finished
```typescript
Test Case:
- Game not finished
- Finalize called
- Expected: Error thrown

Expected Result: FAIL (not finished)
Actual Result: ⏳ PENDING
```

#### Test: Finalize Game - Validate Winner Address
```typescript
Test Case:
- Finalize with invalid winner address
- Expected: Error thrown

Expected Result: FAIL (invalid)
Actual Result: ⏳ PENDING
```

### 1.2 RewardService Tests

#### Test: Claim Available Rewards
```typescript
Test Case:
- Player has 1,000,000 lamports in rewards
- Claim called
- Expected: Rewards transferred to player

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Reject Claim with No Rewards
```typescript
Test Case:
- Player has 0 rewards
- Claim called
- Expected: Error thrown

Expected Result: FAIL (no rewards)
Actual Result: ⏳ PENDING
```

#### Test: Handle Precision in Reward Calculation
```typescript
Test Case:
- Reward: 1,234,567,890 lamports
- Claim called
- Expected: Full amount transferred, no precision loss

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Update Total Claimed
```typescript
Test Case:
- Claim 1,000,000 lamports
- Expected: totalClaimed updated

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Update Claimable Amount
```typescript
Test Case:
- Claim 1,000,000 lamports
- Expected: claimableAmount reduced by 1,000,000

Expected Result: PASS
Actual Result: ⏳ PENDING
```

### 1.3 Financial Precision Tests

#### Test: Calculate Fees Without Precision Loss
```typescript
Test Case:
- Entry fee: 1,234,567,890 lamports
- Platform fee (5%): 61,728,394 lamports
- Expected: Correct calculation, no precision loss

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Handle Edge Case Amounts
```typescript
Test Case:
- Entry fee: 1 lamport
- Platform fee (5%): 0 lamports (rounded)
- Expected: Correct handling

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Distribute Without Dust
```typescript
Test Case:
- Total pot: 3,000,000,001 lamports
- Split 2 ways
- Expected: No dust/leftover amounts

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Maintain Precision Through Operations
```typescript
Test Case:
- Multiple operations on same amount
- Expected: Precision maintained throughout

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Use Decimal/BigNumber (Not Float)
```typescript
Test Case:
- Verify all calculations use Decimal.js
- No floating point arithmetic
- Expected: All calculations precise

Expected Result: PASS
Actual Result: ⏳ PENDING
```

---

## 2. Integration Tests

### Test File: `backend/tests/e2e.test.ts`

#### Test: Create Game → Join → Delegate → Finalize
```typescript
Test Case:
1. POST /games - Create game
2. POST /games/:id/join - Join game
3. POST /games/:id/delegate - Delegate to ER
4. POST /games/:id/finalize - Finalize game
Expected: All steps succeed

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: 1v1 Game Complete Flow
```typescript
Test Case:
1. Create 1v1 game
2. Player 1 joins
3. Player 2 joins
4. Delegate to ER
5. Process VRF
6. Both players take shots
7. Finalize game
8. Distribute prizes
Expected: Game completed successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: 2v2 Game Complete Flow
```typescript
Test Case:
1. Create 2v2 game
2. 4 players join (2 per team)
3. Delegate to ER
4. Process VRF
5. All players take shots
6. Finalize game
7. Distribute prizes to 2 winners
Expected: Game completed successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: AI Game Complete Flow
```typescript
Test Case:
1. Create AI practice game
2. Player joins
3. Delegate to ER
4. Process VRF
5. Player takes shot
6. AI takes shot
7. Finalize game
8. No prizes (practice mode)
Expected: Game completed successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Kamino Loan Flow
```typescript
Test Case:
1. Create game with loan
2. Validate collateral (110%)
3. Create loan
4. Execute game
5. Repay loan
6. Distribute prizes
Expected: Loan flow completed successfully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Error Recovery Flows
```typescript
Test Case:
1. Test transaction failures
2. Verify state rollback
3. Test retry mechanisms
4. Verify error messages
Expected: Errors handled gracefully

Expected Result: PASS
Actual Result: ⏳ PENDING
```

### Database Operations

#### Test: Create Game in Database
```typescript
Test Case:
- Create game record
- Expected: Record created with correct data

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Update Game State
```typescript
Test Case:
- Update game status
- Expected: Status updated correctly

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Query Game by ID
```typescript
Test Case:
- Query game by ID
- Expected: Correct game returned

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Query Player Rewards
```typescript
Test Case:
- Query player rewards
- Expected: Correct rewards returned

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### Test: Update Reward Claims
```typescript
Test Case:
- Update reward claim status
- Expected: Status updated correctly

Expected Result: PASS
Actual Result: ⏳ PENDING
```

---

## 3. E2E Tests

### API Endpoints

#### POST /games - Create Game
```typescript
Test Case:
- Request: { creator: 'player1', mode: 'OneVsOne', entryFee: '100000000' }
- Expected: 201 Created, gameId returned

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /games/:id/join - Join Game
```typescript
Test Case:
- Request: { player: 'player2' }
- Expected: 200 OK, player added to game

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### GET /games/:id - Get Game State
```typescript
Test Case:
- Request: GET /games/game1
- Expected: 200 OK, game state returned

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /games/:id/delegate - Delegate Game
```typescript
Test Case:
- Request: { delegateTo: 'ephemeral-rollup' }
- Expected: 200 OK, game delegated

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /games/:id/vrf - Process VRF
```typescript
Test Case:
- Request: { randomness: '...' }
- Expected: 200 OK, VRF processed

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /games/:id/shot - Take Shot
```typescript
Test Case:
- Request: { player: 'player1' }
- Expected: 200 OK, shot recorded

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /games/:id/finalize - Finalize Game
```typescript
Test Case:
- Request: { winner: 'player1' }
- Expected: 200 OK, game finalized

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### GET /players/:id/rewards - Get Rewards
```typescript
Test Case:
- Request: GET /players/player1/rewards
- Expected: 200 OK, rewards returned

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### POST /rewards/claim - Claim Rewards
```typescript
Test Case:
- Request: { player: 'player1' }
- Expected: 200 OK, rewards claimed

Expected Result: PASS
Actual Result: ⏳ PENDING
```

### Error Handling

#### 400 Bad Request
```typescript
Test Case:
- Invalid input data
- Expected: 400 Bad Request

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### 401 Unauthorized
```typescript
Test Case:
- Missing auth header
- Expected: 401 Unauthorized

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### 403 Forbidden
```typescript
Test Case:
- Unauthorized access
- Expected: 403 Forbidden

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### 404 Not Found
```typescript
Test Case:
- Non-existent resource
- Expected: 404 Not Found

Expected Result: PASS
Actual Result: ⏳ PENDING
```

#### 500 Internal Server Error
```typescript
Test Case:
- Server error
- Expected: 500 Internal Server Error

Expected Result: PASS
Actual Result: ⏳ PENDING
```

---

## 4. Precision Testing

### Decimal Arithmetic
- [ ] Use Decimal/BigNumber for all calculations
- [ ] No floating point arithmetic
- [ ] Rounding rules consistent
- [ ] Total = sum of parts
- [ ] No dust/leftover amounts

### Edge Cases
- [ ] Minimum amounts (1 lamport)
- [ ] Maximum amounts (u64::MAX)
- [ ] Rounding behavior
- [ ] Precision loss minimal

---

## 5. Security Testing (Schemathesis)

### Configuration: `backend/schemathesis-config.yaml`

#### SQL Injection Tests
- [ ] Test with SQL injection payloads
- [ ] Verify parameterized queries
- [ ] No database errors exposed
- [ ] No unauthorized data access

#### XSS Tests
- [ ] Test with XSS payloads
- [ ] Verify output encoding
- [ ] No script execution
- [ ] No HTML injection

#### CSRF Tests
- [ ] Verify CSRF token validation
- [ ] Test missing CSRF token
- [ ] Test invalid CSRF token
- [ ] Test expired CSRF token

#### Authentication Tests
- [ ] Test missing auth header
- [ ] Test invalid token
- [ ] Test expired token
- [ ] Test wrong user ID
- [ ] Test empty token
- [ ] Test malformed token

#### Authorization Tests
- [ ] Test access other user data
- [ ] Test modify other user data
- [ ] Test delete other user data
- [ ] Test privilege escalation

#### Rate Limiting Tests
- [ ] Test rate limit enforcement
- [ ] Verify 429 response
- [ ] Test rate limit reset
- [ ] Test rate limit bypass attempts

#### Input Validation Tests
- [ ] Test missing required fields
- [ ] Test invalid data types
- [ ] Test out of range values
- [ ] Test oversized payloads
- [ ] Test special characters
- [ ] Test unicode characters
- [ ] Test null bytes

#### Output Encoding Tests
- [ ] Verify HTML encoding
- [ ] Verify JSON encoding
- [ ] Verify URL encoding
- [ ] No unencoded output

---

## Execution Commands

### Unit Tests
```bash
cd backend && npm test
```

### Unit Tests with Coverage
```bash
cd backend && npm test -- --coverage
```

### Integration Tests
```bash
cd backend && npm run test:integration
```

### E2E Tests
```bash
cd backend && npm run test:e2e
```

### Security Tests
```bash
schemathesis run http://localhost:3000/api/openapi.json
```

---

## Summary

### Test Categories
- **GameService**: 15 tests
- **RewardService**: 5 tests
- **Financial Precision**: 5 tests
- **Integration**: 6 tests
- **E2E Endpoints**: 9 tests
- **Error Handling**: 5 tests
- **Security**: 30+ tests

**Total Backend Tests**: 75+ tests

### Coverage Target
- Line coverage: >= 80%
- Branch coverage: >= 80%

### Status
- **Overall Completion**: 10%
- **Current Phase**: Unit Tests (In Progress)
- **Next Phase**: Integration Tests

---

**Last Updated**: February 22, 2026

