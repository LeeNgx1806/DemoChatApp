import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import PrivateRoute from './components/PrivateRoute';
import ChatBox from './components/chat/ChatBox';
import Login from './components/userAuth/Login';
import Register from './components/userAuth/Register';
import './index.css';

const Loading = () => (
  <div className="loading">Loading...</div>
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthProvider>
        <Router>
          <WebSocketProvider>
            <div className="app-wrapper">
              <div className='container'>
                <Routes>
                  <Route 
                    path="/" 
                    element={<Navigate to="/login" replace />} 
                  />
                  <Route 
                    path="/login" 
                    element={<Login />} 
                  />
                  <Route 
                    path="/register" 
                    element={<Register />} 
                  />
                  <Route
                    path="/chat"
                    element={
                      <PrivateRoute>
                        <ChatBox />
                      </PrivateRoute>
                    }
                  />
                  <Route 
                    path="*" 
                    element={<Navigate to="/login" replace />} 
                  />
                </Routes>
              </div>
            </div>
          </WebSocketProvider>
        </Router>
      </AuthProvider>
    </Suspense>
  );
}

export default App;