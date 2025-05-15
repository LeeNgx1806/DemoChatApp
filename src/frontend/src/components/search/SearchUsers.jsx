import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './search.css';

const SearchUsers = ({ onClose, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('Searching for:', searchTerm);
      console.log('Current user:', currentUser);

      // First try the OPTIONS request
      const checkResponse = await fetch(`https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/users?username=${encodeURIComponent(searchTerm)}`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.userId
        }
      });

      const response = await fetch(`https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/users?username=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.userId,
          'Origin': window.location.origin
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search response:', data);

      // Handle the DynamoDB response format
      const users = Array.isArray(data) ? data : [data];
      const formattedUsers = users.map(user => ({
        userId: user.userId?.S || user.userId,
        username: user.username?.S || user.username,
        email: user.email?.S || user.email
      }));

      // Filter out current user from results
      const filteredResults = formattedUsers.filter(user => 
        user.userId !== currentUser.userId &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('Filtered results:', filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      // Show a more user-friendly error message
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (selectedUser) => {
    try {
      console.log('Creating chat with user:', selectedUser);
      
      const response = await fetch('https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.userId
        },
        body: JSON.stringify({
          userId: currentUser.userId,
          otherUserId: selectedUser.userId
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat created:', data);
      
      // Format the chat data if needed
      const formattedChat = {
        chatId: { S: data.chatId?.S || data.chatId },
        name: { S: selectedUser.username },
        participants: { L: [
          { S: currentUser.userId },
          { S: selectedUser.userId }
        ]},
        createdAt: { S: new Date().toISOString() }
      };

      onChatCreated(formattedChat);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="search-overlay">
      <div className="search-container">
        <div className="search-header">
          <h2>Create a New Chat</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username..."
            className="search-input"
            autoFocus
          />
          <button 
            onClick={handleSearch}
            className="search-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user.userId} className="user-result">
              <div className="user-info">
                <img src="/avatar.png" alt="User Avatar" className="user-avatar" />
                <div className="user-details">
                  <span className="username">{user.username}</span>
                  {user.email && <span className="email">{user.email}</span>}
                </div>
              </div>
              <button 
                onClick={() => createChat(user)}
                className="start-chat-btn"
              >
                Start Chat
              </button>
            </div>
          ))}
          {searchResults.length === 0 && searchTerm && !isLoading && (
            <div className="no-results">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
