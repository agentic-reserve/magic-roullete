'use client';

import { useState } from 'react';

interface RevolverCylinderProps {
  isSpinning?: boolean;
  onSpinComplete?: () => void;
  selectedChamber?: number;
}

export function RevolverCylinder({
  isSpinning = false,
  onSpinComplete,
  selectedChamber = 0,
}: RevolverCylinderProps) {
  const [rotation, setRotation] = useState(0);
  const chambers = 6;

  const handleSpin = () => {
    if (isSpinning) return;

    const spins = Math.floor(Math.random() * 4) + 3;
    const finalRotation = rotation + spins * 360 + Math.random() * 60;
    setRotation(finalRotation);

    setTimeout(() => {
      onSpinComplete?.();
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      {/* Revolver Visualization */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer ring (barrel) */}
        <div className="absolute inset-0 border-4 border-primary rounded-full opacity-50" />

        {/* Cylinder with chambers */}
        <div
          className={`relative w-64 h-64 border-4 border-accent rounded-full transition-transform ${
            isSpinning ? 'revolver-spin' : ''
          }`}
          style={{
            transform: `rotateZ(${rotation}deg)`,
            transitionDuration: isSpinning ? '0.6s' : '0.2s',
          }}
        >
          {/* Chambers */}
          {Array.from({ length: chambers }).map((_, i) => {
            const angle = (i / chambers) * 360;
            const isSelected = i === selectedChamber;

            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{
                  transform: `rotateZ(${angle}deg)`,
                }}
              >
                {/* Chamber dot */}
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'bg-accent border-accent shadow-lg shadow-accent'
                      : 'bg-secondary border-primary'
                  }`}
                />
              </div>
            );
          })}

          {/* Center pivot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-accent border-2 border-primary shadow-lg shadow-accent/50" />
          </div>
        </div>

        {/* Hammer indicator (top) */}
        <div className="absolute top-0 w-2 h-8 bg-primary rounded-full pointer-events-none" />
      </div>

      {/* Info Display */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isSpinning ? 'Spinning...' : `Chamber ${selectedChamber + 1} Selected`}
        </p>
        <p className="text-xs text-muted-foreground">
          Click the revolver to spin
        </p>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="gun-metal-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? 'Spinning...' : 'Spin Cylinder'}
      </button>
    </div>
  );
}
