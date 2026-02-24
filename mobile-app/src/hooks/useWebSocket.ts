import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketService } from '../services/websocket';
import { WS_EVENTS } from '../lib/constants';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsService = useRef(getWebSocketService());

  useEffect(() => {
    const service = wsService.current;

    // Connect on mount
    service.connect().catch(err => {
      console.error('Failed to connect to WebSocket:', err);
      setError(err);
    });

    // Listen for connection events
    const unsubscribeConnect = service.on(WS_EVENTS.CONNECT, () => {
      setConnected(true);
      setError(null);
    });

    const unsubscribeDisconnect = service.on(WS_EVENTS.DISCONNECT, () => {
      setConnected(false);
    });

    const unsubscribeError = service.on(WS_EVENTS.ERROR, (err) => {
      setError(err);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    return wsService.current.on(event, handler);
  }, []);

  const subscribeToGame = useCallback((gameId: string, handler: (data: any) => void) => {
    return wsService.current.subscribeToGame(gameId, handler);
  }, []);

  const send = useCallback((message: any) => {
    wsService.current.send(message);
  }, []);

  return {
    connected,
    error,
    subscribe,
    subscribeToGame,
    send,
    isConnected: () => wsService.current.isConnected(),
  };
}

/**
 * Hook for subscribing to game updates
 */
export function useGameUpdates(gameId: string | null, onUpdate: (data: any) => void) {
  const { subscribeToGame } = useWebSocket();

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, onUpdate);

    return () => {
      unsubscribe();
    };
  }, [gameId, onUpdate, subscribeToGame]);
}
