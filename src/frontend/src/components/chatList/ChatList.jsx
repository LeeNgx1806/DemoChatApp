import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./chatList.css";
import SearchUsers from '../search/SearchUsers';

const ChatList = ({ setSelectedChat }) => {
    const { currentUser, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!currentUser?.userId) return;

        const fetchChats = async () => {
            try {
                const response = await fetch("https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/chatrooms", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "user-id": currentUser.userId,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setChats(data);
            } catch (error) {
                console.error("Error fetching chat rooms:", error);
            }
        };

        fetchChats();
    }, [currentUser?.userId]);

    const filteredChats = chats.filter(chat => 
        chat.name?.S.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const handleChatCreated = (newChat) => {
        setChats(prevChats => [...prevChats, newChat]);
    };

    return (
        <div className="chatList">
            <div className="userInfo">
                <div className="user">
                    <img src="/avatar.png" alt="User Avatar" />
                    <p>{currentUser?.username}</p>
                </div>
                <div className="icons">
                    <img 
                        src="/logOut.png" 
                        alt="Logout" 
                        onClick={handleLogoutClick}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>

            <div className="search">
                <div className="searchBar">
                    <img src="/search.png" alt="Search" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <img 
                    src="/group.png"
                    alt="New Chat" 
                    className="add" 
                    onClick={() => setShowSearch(true)}
                    style={{ cursor: 'pointer' }}
                />
            </div>
            
            {filteredChats.map((chat) => (
                <div 
                    className="item" 
                    key={chat.chatId.S} 
                    onClick={() => setSelectedChat(chat)}
                >
                    <img src="/avatar.png" alt="Avatar" />
                    <div className="texts">
                        <span>{chat.name?.S}</span>
                        <p>{chat.lastMessage?.S || "No messages yet"}</p>
                    </div>
                </div>
            ))}
            
            {showSearch && (
                <SearchUsers 
                    onClose={() => setShowSearch(false)}
                    onChatCreated={handleChatCreated}
                />
            )}

            {showLogoutConfirm && (
                <div className="logout-confirm-overlay">
                    <div className="logout-confirm-container">
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to logout?</p>
                        <div className="logout-confirm-buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-btn"
                                onClick={handleLogoutConfirm}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;
