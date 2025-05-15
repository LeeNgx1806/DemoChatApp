import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [wsConnection, setWsConnection] = useState(null);
  const [messages, setMessages] = useState({});  // Messages by chatId
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const connectToChat = useCallback((chatId) => {
    if (!currentUser || isConnecting) return;

    setIsConnecting(true);
    setCurrentChatId(chatId);

    try {
      if (wsConnection) {
        wsConnection.close();
      }

      const ws = new WebSocket(`wss://w67ljvr3fa.execute-api.ap-southeast-2.amazonaws.com/dev/?chatId=${chatId}&userId=${currentUser.userId}`);

      ws.onopen = () => {
        console.log(`Connected to chat: ${chatId}`);
        setIsConnecting(false);
        // Request past messages
        ws.send(JSON.stringify({
          action: 'getMessages',
          chatId: chatId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          if (data.type === 'messages') {
            setMessages(prev => ({
              ...prev,
              [chatId]: Array.isArray(data.messages) ? data.messages : []
            }));
          } else if (data.type === 'newMessage') {
            setMessages(prev => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), data.message]
            }));
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnecting(false);
        setWsConnection(null);
        
        // Attempt to reconnect after a delay if we're still on the chat page
        if (location.pathname.includes('/chat') && currentChatId === chatId) {
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectToChat(chatId);
          }, 3000);
        }
      };

      setWsConnection(ws);
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setIsConnecting(false);
    }
  }, [currentUser, isConnecting, wsConnection, location.pathname, currentChatId]);

  // Disconnect WebSocket when leaving chat page
  useEffect(() => {
    if (!location.pathname.includes('/chat')) {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
        setMessages({});
        setCurrentChatId(null);
      }
    }
  }, [location.pathname]);

  const sendMessage = useCallback((chatId, message) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      // Attempt to reconnect if not connected
      if (!isConnecting) {
        connectToChat(chatId);
      }
      return;
    }

    const newMessage = {
      senderId: currentUser.userId,
      text: message,
      timestamp: new Date().toISOString()
    };

    try {
      // Update local state immediately
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      // Send to server
      wsConnection.send(JSON.stringify({
        action: 'sendMessage',
        chatId: chatId,
        ...newMessage
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      if (!isConnecting) {
        connectToChat(chatId);
      }
    }
  }, [wsConnection, currentUser, isConnecting, connectToChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
        setMessages({});
        setCurrentChatId(null);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ 
      connectToChat, 
      sendMessage, 
      messages,
      isConnecting
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
