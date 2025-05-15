import { createContext, useState, useContext, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        return JSON.parse(localStorage.getItem("currentUser")) || null;
    });

    const [chatId, setChatId] = useState(null);

    // Sync currentUser with localStorage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
    }, [currentUser]);

    return (
        <ChatContext.Provider value={{ currentUser, setCurrentUser, chatId, setChatId }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
