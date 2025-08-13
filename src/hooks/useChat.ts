// frontend/src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api';
import type { ChatMessage, ChatSession } from '../types';

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string, 
    sessionId?: string
  ): Promise<{
    sessionId: string;
    message: ChatMessage;
    intent: string;
    confidence: number;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatAPI.sendMessage(message, sessionId);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to send message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessions = useCallback(async (): Promise<ChatSession[]> => {
    try {
      return await chatAPI.getSessions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch sessions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<ChatSession> => {
    try {
      return await chatAPI.getSession(sessionId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch session';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    sendMessage,
    getSessions,
    getSession,
    loading,
    error
  };
}