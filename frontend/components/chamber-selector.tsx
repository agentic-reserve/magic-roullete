'use client';

import { useState } from 'react';

interface ChamberSelectorProps {
  onSelectChamber: (chamber: number) => void;
  disabled?: boolean;
  selectedChamber?: number | null;
  chambersStatus?: ('empty' | 'loaded' | 'unknown')[];
}

export function ChamberSelector({
  onSelectChamber,
  disabled = false,
  selectedChamber = null,
  chambersStatus = Array(6).fill('unknown'),
}: ChamberSelectorProps) {
  const [hoveredChamber, setHoveredChamber] = useState<number | null>(null);

  const getStatusColor = (status: 'empty' | 'loaded' | 'unknown', index: number) => {
    if (selectedChamber === index) {
      return 'ring-2 ring-primary ring-offset-2 ring-offset-background';
    }
    if (hoveredChamber === index) {
      return 'border-primary';
    }
    return 'border-border';
  };

  const getStatusBg = (status: 'empty' | 'loaded' | 'unknown') => {
    if (status === 'unknown') return 'bg-muted hover:bg-muted/80';
    if (status === 'empty') return 'bg-green-950 hover:bg-green-900';
    return 'bg-red-950 hover:bg-red-900';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Select a Chamber</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose wisely. Only one chamber is safe.
        </p>
      </div>

      {/* Chamber Grid */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 max-w-md">
        {chambersStatus.map((status, index) => (
          <button
            key={index}
            onClick={() => {
              if (!disabled) {
                onSelectChamber(index);
              }
            }}
            onMouseEnter={() => setHoveredChamber(index)}
            onMouseLeave={() => setHoveredChamber(null)}
            disabled={disabled}
            className={`
              relative aspect-square rounded-lg border-2 transition-all
              ${getStatusColor(status, index)}
              ${getStatusBg(status)}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
          >
            {/* Chamber Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl font-bold text-foreground">{index + 1}</span>
              
              {/* Status Icon */}
              {status !== 'unknown' && (
                <span className="text-xs font-semibold uppercase">
                  {status === 'empty' ? '✓' : '✗'}
                </span>
              )}
            </div>

            {/* Selected Indicator */}
            {selectedChamber === index && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Info Text */}
      <div className="pt-4 space-y-2">
        {selectedChamber !== null && (
          <p className="text-sm text-primary font-semibold">
            Chamber {selectedChamber + 1} selected
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted border border-border" />
            <span>Unknown</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-950 border border-border" />
            <span>Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-950 border border-border" />
            <span>Loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
