import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, Plus, Trash2 } from 'lucide-react';
import { chatAPI } from '../services/api';
import type { ChatMessage, ChatSession } from '../types';

type User = {
  id: string;
  name: string;
  email: string;
  role?: 'resident' | 'staff' | 'admin';
};

type Page = 'login' | 'signup' | 'dashboard' | 'chatbot' | 'incidents' | 'profile';

interface ChatbotInterfaceProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

// Enhanced typing effect with auto-scroll
const TypingMessage = ({ content, onComplete, onUpdate }: { 
  content: string; 
  onComplete?: () => void;
  onUpdate?: (text: string) => void;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        const newText = displayedText + content[currentIndex];
        setDisplayedText(newText);
        setCurrentIndex(prev => prev + 1);
        
        // Notify parent of text update for auto-scroll
        if (onUpdate) {
          onUpdate(newText);
        }
      }, 35);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, displayedText, onComplete, onUpdate]);

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {displayedText}
      {currentIndex < content.length && (
        <span className="animate-pulse text-emerald-400 ml-1 text-lg">●</span>
      )}
    </div>
  );
};

export function ChatbotInterface({ user, onNavigate, onLogout }: ChatbotInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Enhanced auto-scroll during typing
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  // Load chat sessions on component mount
  useEffect(() => {
    console.log('ChatbotInterface mounted, loading sessions...');
    loadChatSessions();
  }, []);

  // Load specific session when currentSessionId changes
  useEffect(() => {
    if (currentSessionId) {
      loadSession(currentSessionId);
    }
  }, [currentSessionId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Auto-focus input after AI response
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const loadChatSessions = async () => {
    try {
      console.log('Loading chat sessions...');
      setIsLoadingSessions(true);
      const sessions = await chatAPI.getSessions();
      console.log('Sessions loaded successfully:', sessions);
      setChatSessions(sessions);
      
      if (!currentSessionId && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const session = await chatAPI.getSession(sessionId);
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const cleanAIResponse = (content: string): string => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s*(.*?)$/gm, '$1')
      .trim();
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);
    }

    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(messageToSend, currentSessionId || undefined);
      
      const aiMessage: ChatMessage = {
        id: response.message.id || (Date.now() + 1).toString(),
        type: 'ai',
        content: cleanAIResponse(response.message.content),
        timestamp: new Date(response.message.timestamp),
        citations: response.message.citations
      };

      setTypingMessageId(aiMessage.id);

      if (!currentSessionId && response.sessionId) {
        setCurrentSessionId(response.sessionId);
        await loadChatSessions();
      }

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : {
        id: response.sessionId,
        title: messageToSend.substring(0, 50) + (messageToSend.length > 50 ? '...' : ''),
        timestamp: new Date(),
        messages: [userMessage, aiMessage]
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your message. Please try again. 😅',
        timestamp: new Date(),
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setCurrentSessionId(null);
    setCurrentSession(null);
    setTypingMessageId(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setCurrentSession(null);
        setTypingMessageId(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Handle typing updates to auto-scroll
  const handleTypingUpdate = () => {
    scrollToBottom(false); // Instant scroll during typing
  };

  return (
    <Layout user={user} currentPage="chatbot" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex gap-4">
        
        {/* Chat History Sidebar */}
        <div className="hidden lg:block w-72">
          <Card className="h-full bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  💬 Chat History
                </CardTitle>
                <Button 
                  onClick={handleNewChat} 
                  size="sm" 
                  variant="outline"
                  className="hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-2 p-3">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-2xl">⏳</div>
                    </div>
                  ) : chatSessions.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="text-4xl mb-3">💭</div>
                      <p className="text-sm text-slate-600">No conversations yet</p>
                      <p className="text-xs text-slate-500">Start chatting to see history here!</p>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div key={session.id} className="group relative">
                        <button
                          onClick={() => setCurrentSessionId(session.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                            session.id === currentSessionId
                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 shadow-sm border border-blue-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm mt-0.5">💼</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{session.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(session.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1">
          <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-slate-200/50">
            
            {/* Header */}
            <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      Kenya Civic Assistant 🇰🇪
                    </CardTitle>
                    <p className="text-sm text-slate-600">Your friendly government services helper</p>
                  </div>
                </div>
                <Button 
                  onClick={handleNewChat} 
                  size="sm" 
                  variant="outline" 
                  className="lg:hidden hover:bg-emerald-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0 bg-gradient-to-b from-slate-50/30 to-white/50 relative overflow-hidden">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-6 min-h-full">
                  {!currentSession || currentSession.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center max-w-lg">
                        <div className="text-6xl mb-4">🏛️</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">
                          Karibu! Welcome to Kenya 🇰🇪
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                          I'm here to help you with government services, from voting to permits to taxes! 
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4 text-left">
                          <button 
                            onClick={() => handleSuggestionClick("How do I register to vote in Kenya? 🗳️")}
                            className="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl group-hover:scale-110 transition-transform">🗳️</span>
                              <div>
                                <p className="font-medium text-slate-800">Voter Registration</p>
                                <p className="text-sm text-slate-600">Learn how to register with IEBC</p>
                              </div>
                            </div>
                          </button>
                          
                          <button 
                            onClick={() => handleSuggestionClick("When are property rates due in Nairobi? 🏠")}
                            className="group bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 p-4 rounded-xl border border-slate-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
                              <div>
                                <p className="font-medium text-slate-800">Property Taxes</p>
                                <p className="text-sm text-slate-600">County rates and payments</p>
                              </div>
                            </div>
                          </button>
                          
                          <button 
                            onClick={() => handleSuggestionClick("How do I get a building permit? 🏗️")}
                            className="group bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 p-4 rounded-xl border border-slate-200 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl group-hover:scale-110 transition-transform">🏗️</span>
                              <div>
                                <p className="font-medium text-slate-800">Building Permits</p>
                                <p className="text-sm text-slate-600">Construction approvals</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentSession.messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.type === 'ai' && (
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="text-lg">🤖</span>
                            </div>
                          )}
                          
                          <div className={`max-w-[75%] ${message.type === 'user' ? 'order-2' : ''}`}>
                            <div
                              className={`p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900 hover:shadow-md'
                              }`}
                            >
                              {message.type === 'ai' && typingMessageId === message.id ? (
                                <TypingMessage 
                                  content={message.content} 
                                  onComplete={() => setTypingMessageId(null)}
                                  onUpdate={handleTypingUpdate}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              )}
                            </div>
                            
                            {message.citations && message.citations.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                  📚 Sources:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {message.citations.map((citation, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                    >
                                      [{index + 1}] {citation}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                              🕐 {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          
                          {message.type === 'user' && (
                            <div className="w-9 h-9 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg order-1 flex-shrink-0">
                              <span className="text-lg">👤</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-lg">🤖</span>
                          </div>
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-600">Thinking</span>
                              <div className="flex space-x-1">
                                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-lg">🧠</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-slate-200/50 p-4 bg-white/90 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="💬 Ask about voting, taxes, permits, county services..."
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="w-full border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 bg-white/90 text-slate-900 placeholder:text-slate-500 transition-all duration-200 pr-12 py-3 text-base rounded-xl"
                    autoFocus
                  />
                  {currentMessage && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      ✨
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 shadow-lg px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg animate-spin">⏳</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span className="text-sm">🚀</span>
                    </div>
                  )}
                </Button>
              </div>
              
              {/* Quick suggestions when input is focused */}
              {!currentMessage && !isLoading && (!currentSession || currentSession.messages.length === 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSuggestionClick("🗳️ IEBC registration")}
                    className="text-xs bg-slate-100 hover:bg-emerald-100 text-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-200 hover:border-emerald-300"
                  >
                    🗳️ IEBC registration
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("🏠 Nairobi county rates")}
                    className="text-xs bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-200 hover:border-blue-300"
                  >
                    🏠 County rates
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("🏗️ Building permits")}
                    className="text-xs bg-slate-100 hover:bg-orange-100 text-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-200 hover:border-orange-300"
                  >
                    🏗️ Building permits
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("🚨 Emergency numbers")}
                    className="text-xs bg-slate-100 hover:bg-red-100 text-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 border border-slate-200 hover:border-red-300"
                  >
                    🚨 Emergency numbers
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}