import { useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";

const MessageInput = ({ chatId }) => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useWebSocket();

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessage(chatId, message);
    setMessage("");
  };

  return (
    <div className="message-input">
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..." 
      />
      <button 
        className="send-btn" 
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;