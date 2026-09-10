'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '@/services/api';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

/** Strips the `/api/v1` suffix — Socket.IO connects to the server origin. */
function socketOrigin(): string {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return 'http://localhost:4000';
  }
}

export interface UseMessagingSocket {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  /** Registers a listener and returns its cleanup. Safe before the socket exists. */
  on: (event: string, handler: (payload: any) => void) => () => void;
  emit: (event: string, payload?: any) => void;
}

/**
 * Owns the single dashboard socket. The token is read at connect time so a
 * logout/login cycle re-authenticates instead of reusing a dead session.
 */
export function useMessagingSocket(enabled: boolean): UseMessagingSocket {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  // Listeners registered before connect are replayed onto the live socket.
  const pending = useRef<Array<[string, (payload: any) => void]>>([]);

  useEffect(() => {
    if (!enabled) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
    if (!token) return;

    setStatus('CONNECTING');
    const socket = io(`${socketOrigin()}/messaging`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;
    for (const [event, handler] of pending.current) socket.on(event, handler);

    socket.on('connect', () => setStatus('CONNECTED'));
    socket.on('disconnect', () => setStatus('RECONNECTING'));
    socket.on('connect_error', () => setStatus('RECONNECTING'));
    socket.io.on('reconnect_attempt', () => setStatus('RECONNECTING'));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setStatus('DISCONNECTED');
    };
  }, [enabled]);

  const on = useCallback((event: string, handler: (payload: any) => void) => {
    pending.current.push([event, handler]);
    socketRef.current?.on(event, handler);

    return () => {
      pending.current = pending.current.filter(([e, h]) => !(e === event && h === handler));
      socketRef.current?.off(event, handler);
    };
  }, []);

  const emit = useCallback((event: string, payload?: any) => {
    socketRef.current?.emit(event, payload ?? {});
  }, []);

  return { socket: socketRef.current, connectionStatus: status, on, emit };
}
