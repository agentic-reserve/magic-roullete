'use client';

import { ReactNode } from 'react';

interface GameBoardProps {
  gameId: string;
  gameMode: '1v1' | '2v2';
  potSize: number;
  timeRemaining?: number;
  currentTurn: string;
  gameStatus: 'waiting' | 'active' | 'finished';
  children?: ReactNode;
}

export function GameBoard({
  gameId,
  gameMode,
  potSize,
  timeRemaining,
  currentTurn,
  gameStatus,
  children,
}: GameBoardProps) {
  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Game ID */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Game ID
            </p>
            <p className="font-mono text-sm text-primary font-semibold break-all">
              {gameId.slice(0, 8)}...
            </p>
          </div>

          {/* Game Mode */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Game Mode
            </p>
            <p className="text-lg font-bold text-foreground">
              {gameMode === '1v1' ? '1v1 Duel' : '2v2 Team'}
            </p>
          </div>

          {/* Pot Size */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Prize Pool
            </p>
            <p className="text-lg font-bold text-accent">{potSize} SOL</p>
          </div>

          {/* Time Remaining */}
          {timeRemaining !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Time Left
              </p>
              <p className={`text-lg font-bold ${
                timeRemaining < 10 ? 'text-accent' : 'text-primary'
              }`}>
                {timeRemaining}s
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Current Status
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  gameStatus === 'waiting'
                    ? 'bg-muted animate-pulse'
                    : gameStatus === 'active'
                    ? 'bg-primary animate-pulse'
                    : 'bg-accent'
                }`}
              />
              <p className="font-semibold text-foreground capitalize">
                {gameStatus === 'waiting'
                  ? 'Waiting for Players'
                  : gameStatus === 'active'
                  ? 'Game Active'
                  : 'Game Finished'}
              </p>
            </div>
          </div>

          {gameStatus === 'active' && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Current Turn
              </p>
              <p className="font-bold text-primary">{currentTurn}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {children && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}
