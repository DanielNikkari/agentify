// src/pages/Chat.tsx
import { useState, useEffect, useRef } from 'react';
import ChatTextarea from '../components/ChatTextarea';
import AgentifyLoader from '../components/AgentifyLoader';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import TermsAndConditions from '../components/TermsAndConditions';
import {
  getOrCreateSession,
  createChatWebSocket,
  sendWebSocketMessage,
  getAgent,
  Message,
  Session,
} from '../api/agents';

export default function Chat() {
  const { agentId } = useParams<{ agentId: string }>();
  const [messageInput, setMessageInput] = useState('');

  const [sessionId, setSessionId] = useState<string>('');

  // terms and conditions state
  const [showTerms, setShowTerms] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  let [isAgentTyping, setIsAgentTyping] = useState(false);

  // Streaming message state - for displaying content as it arrives
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  // Agent info
  const [agentName, setAgentName] = useState<string>('Chat');

  // Random pencil color - pick one when typing starts
  const [pencilColor, setPencilColor] = useState<string>('var(--color-agentify-accent-coral)');

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Reference to scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages or streaming message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Format timestamp to "HH:mm dd.MM.yyyy"
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp; // Return original if invalid
      }

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${hours}:${minutes} ${day}.${month}.${year}`;
    } catch (e) {
      return timestamp; // Return original if parsing fails
    }
  };

  // Fetch initial session and establish WebSocket connection
  useEffect(() => {
    console.log('Chat mounted with agentId:', agentId);

    if (!agentId) {
      console.error('Missing required param - agentId:', agentId);
      setError('Agent ID is required');
      setLoading(false);
      return;
    }

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch agent info
        const agentInfo = await getAgent(agentId);
        setAgentName(agentInfo.name);

        // Fetch session from backend (gets or creates session with messages)
        const session: Session = await getOrCreateSession(agentId);
        console.log(
          'Fetched session:',
          session.session_id,
          'with',
          session.messages.length,
          'messages'
        );

        // Set the session ID
        setSessionId(session.session_id);

        // Set messages from server
        setMessages(session.messages);

        // Establish WebSocket connection
        const ws = createChatWebSocket(
          agentId,
          session.session_id,
          (message: Message) => {
            console.log('Received complete message from agent:', message);
            // Add final message to the list
            setMessages((prevMessages) => [...prevMessages, message]);
          },
          (error) => {
            console.error('WebSocket error:', error);
            setError('Connection error occurred');
            setIsConnected(false);
            setIsAgentTyping(false);
            setStreamingMessage('');
          },
          (event) => {
            console.log('WebSocket closed:', event);
            setIsConnected(false);
            setIsAgentTyping(false);
            setStreamingMessage('');
            // Optionally implement reconnection logic here
          },
          // onStreamChunk - called for each content chunk
          (chunk: string) => {
            console.log('Received streaming chunk:', chunk);
            setStreamingMessage((prev) => prev + chunk);
          },
          // onStreamStart - called when agent starts responding
          () => {
            console.log('Stream started');
            setIsAgentTyping(true);
            setStreamingMessage('');
          },
          // onStreamEnd - called when stream completes
          () => {
            console.log('Stream ended');
            setIsAgentTyping(false);
            setStreamingMessage('');
          }
        );

        wsRef.current = ws;

        // Set connected status when WebSocket opens
        ws.addEventListener('open', () => {
          setIsConnected(true);
        });
      } catch (err: any) {
        console.error('Error initializing chat:', err);
        setError(err.response?.data?.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [agentId]);

  const handleSendMessage = () => {
    if (messageInput.trim() && wsRef.current) {
      console.log('Sending message:', messageInput);

      // Optimistically add user message to UI
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageInput,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Send message through WebSocket
      // Chat history is automatically handled by the backend via Firestore
      sendWebSocketMessage(wsRef.current, messageInput);

      // Randomly select a color for the pencil
      const colors = [
        'var(--color-agentify-accent-coral)',
        'var(--color-agentify-accent-green)',
        'var(--color-agentify-accent-blue)',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setPencilColor(randomColor);

      // Show agent typing indicator
      console.log('Setting isAgentTyping to true');
      setIsAgentTyping(true);

      setMessageInput('');
    }
  };

  return (
    <div className="flex h-screen bg-agentify-bg-gray overflow-hidden">
      {/* Navigation Sidebar */}
      <Navigation onOpenTerms={() => setShowTerms(true)} />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Chat info - fixed height at top */}
        <section
          id="chat-info"
          className="flex-shrink-0 h-16 px-6 flex items-center justify-between"
        >
          <h1 className="text-agentify-dark-gray">{agentName}</h1>
          {/* Connection status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-agentify-dark-gray">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </section>

        {/* Message area - takes remaining space and scrolls */}
        <section id="message-area" className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-agentify-dark-gray">Loading messages...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full"></div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-agentify-accent-coral text-white'
                          : 'text-agentify-dark'
                      }`}
                    >
                      <p className="text-base">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTimestamp(message.timestamp)}
                        {message.tokens && ` • ${message.tokens} tokens`}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Streaming message - shows content as it arrives */}
                {streamingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] rounded-2xl px-4 py-3 text-agentify-dark">
                      <p className="text-base">{streamingMessage}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTimestamp(new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                )}
                {/* Agent typing indicator - Pencil loader (only show when no streaming content yet) */}
                {isAgentTyping && !streamingMessage && (
                  <div className="flex justify-start">
                    <AgentifyLoader type="pencil" color={pencilColor} />
                  </div>
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </section>

        {/* Chat box - fixed at bottom */}
        <section id="chat-box-area" className="flex-shrink-0 p-6">
          <div className="max-w-4xl mx-auto">
            <ChatTextarea
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
            />
          </div>
        </section>
      </main>
      {/* Modal */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
