/**
 * Animated Text Component from React Bits
 * https://www.reactbits.dev/text-animations
 * 
 * Adds smooth text reveal animations
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'blur';
}

export function AnimatedText({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  type = 'fade',
}: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (type) {
        case 'slide':
          return 'opacity-0 translate-y-8';
        case 'scale':
          return 'opacity-0 scale-95';
        case 'blur':
          return 'opacity-0 blur-sm';
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-y-0 scale-100 blur-0';
  };

  return (
    <div
      ref={ref}
      className={`transition-all ${className} ${getAnimationClass()}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {text}
    </div>
  );
}

/**
 * Split Text Animation - Animates each word/character separately
 */
export function SplitTextAnimation({
  text,
  className = '',
  delay = 0,
  stagger = 0.05,
  type = 'word',
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  type?: 'word' | 'char';
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const items = type === 'word' ? text.split(' ') : text.split('');

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {items.map((item, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: `${index * stagger}s`,
          }}
        >
          {item}
          {type === 'word' && index < items.length - 1 && '\u00A0'}
        </span>
      ))}
    </div>
  );
}

/**
 * Glitch Text Effect
 */
export function GlitchText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 -z-10 text-primary animate-glitch-1"
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 -z-10 text-accent animate-glitch-2"
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
}
