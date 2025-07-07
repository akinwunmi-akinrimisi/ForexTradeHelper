import { useEffect, useRef } from 'react';
import { WebSocketManager } from '@/lib/websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const wsRef = useRef<WebSocketManager | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    wsRef.current = new WebSocketManager();

    // Listen for real-time updates
    wsRef.current.on('tradeCreated', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/account-trackers'] });
    });

    wsRef.current.on('accountTrackerCreated', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/account-trackers'] });
    });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}
