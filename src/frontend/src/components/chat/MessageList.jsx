import { useEffect, useRef } from "react";
import "./chat.css";

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.senderId === currentUserId;
        const timestamp = new Date(msg.timestamp).toLocaleTimeString();

        return (
          <div key={index} className={`message ${isOwnMessage ? "own" : ""}`}>
            <div className="texts">
              <p>{msg.text}</p>
            </div>
            <span>{timestamp}</span>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
