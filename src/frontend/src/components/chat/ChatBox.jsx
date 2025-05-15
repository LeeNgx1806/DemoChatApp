import React, { useEffect, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatList from '../chatList/ChatList';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';
import "./chat.css";

const ChatBox = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { connectToChat, messages } = useWebSocket();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (selectedChat && currentUser) {
      connectToChat(selectedChat.chatId.S);
    }
  }, [selectedChat, currentUser]);

  return (
    <div className="chat-container">
      <ChatList setSelectedChat={setSelectedChat} />
      <div className="chat">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="user">
                <img src="/avatar.png" alt="Chat Avatar" />
                <div className="texts">
                  <span>{selectedChat.name?.S}</span>
                </div>
              </div>
            </div>
            <div className="chat-main">
              <MessageList 
                messages={messages[selectedChat.chatId.S] || []} 
                currentUserId={currentUser?.userId}
              />
              <MessageInput chatId={selectedChat.chatId.S} />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;


