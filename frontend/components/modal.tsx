'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footerContent?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerContent,
  size = 'md',
  isDanger = false,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative bg-card border-2 rounded-lg shadow-2xl
          ${isDanger ? 'border-accent' : 'border-border'}
          ${sizeClasses[size]}
          max-h-[90vh] overflow-y-auto
        `}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDanger ? 'border-accent/30' : 'border-border'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDanger ? 'text-accent' : 'text-foreground'}`}>
                {title}
              </h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        {children && <div className="p-6">{children}</div>}

        {/* Footer */}
        {footerContent && (
          <div className={`p-6 border-t ${isDanger ? 'border-accent/30' : 'border-border'} bg-muted/50`}>
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
