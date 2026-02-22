'use client';

import { useState } from 'react';
import { PlayerCard } from '@/components/player-card';
import { ChamberSelector } from '@/components/chamber-selector';
import { GameBoard } from '@/components/game-board';
import { Modal } from '@/components/modal';
import { RevolverCylinder } from '@/components/revolver-cylinder';

export default function Duel1v1Page() {
  const [selectedChamber, setSelectedChamber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSpinComplete = () => {
    setIsSpinning(false);
  };

  const handleChamberSelect = (chamber: number) => {
    if (!isSpinning && gameActive) {
      setSelectedChamber(chamber);
      setShowConfirmation(true);
    }
  };

  const handleConfirmShot = () => {
    setShowConfirmation(false);
    // Game logic would go here
    setGameActive(false);
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Game Info */}
        <GameBoard
          gameId="1v1-duel-001"
          gameMode="1v1"
          potSize={10.5}
          timeRemaining={45}
          currentTurn="Player 1"
          gameStatus="active"
        >
          {/* Players Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Player 1 */}
            <PlayerCard
              playerName="You (SheriffSolana)"
              health={100}
              balance={52.3}
              rank={1}
              badge="sheriff"
              isActive={true}
            />

            {/* Revolver */}
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-primary uppercase tracking-wide">
                  vs
                </p>
                <RevolverCylinder
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                  selectedChamber={selectedChamber ?? 0}
                />
              </div>
            </div>

            {/* Player 2 */}
            <PlayerCard
              playerName="OutlawWinston"
              health={100}
              balance={48.7}
              rank={2}
              badge="outlaw"
              isActive={false}
            />
          </div>

          {/* Chamber Selector */}
          <div className="mt-12 p-8 rounded-lg border-2 border-primary/30 bg-card">
            <ChamberSelector
              onSelectChamber={handleChamberSelect}
              disabled={isSpinning || !gameActive}
              selectedChamber={selectedChamber}
              chambersStatus={['unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown']}
            />
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Prize Pool
              </p>
              <p className="text-2xl font-bold text-accent">10.5 SOL</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Your Stake
              </p>
              <p className="text-2xl font-bold text-primary">5.25 SOL</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Potential Win
              </p>
              <p className="text-2xl font-bold text-green-500">10.5 SOL</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Your Win Rate
              </p>
              <p className="text-2xl font-bold text-primary">68%</p>
            </div>
          </div>
        </GameBoard>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Confirm Your Shot"
          description="Are you ready to pull the trigger?"
          isDanger={true}
          footerContent={
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 rounded border border-border hover:bg-muted transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShot}
                className="flex-1 px-4 py-2 rounded bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-colors"
              >
                Pull Trigger
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-foreground font-semibold">
              You are selecting Chamber {(selectedChamber ?? 0) + 1}
            </p>
            <div className="p-4 rounded bg-muted border border-border space-y-2">
              <p className="text-sm text-muted-foreground">
                If you survive, you win <span className="text-accent font-bold">10.5 SOL</span>
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't survive, you lose <span className="text-accent font-bold">5.25 SOL</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a permanent, blockchain-verified transaction.
            </p>
          </div>
        </Modal>
      </div>
    </main>
  );
}
