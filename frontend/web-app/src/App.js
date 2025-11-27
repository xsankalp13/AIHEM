import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import Playground from './pages/Playground';
import Login from './pages/Login';
import Register from './pages/Register';
import { useStore } from './store/useStore';

function App() {
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useStore();

  useEffect(() => {
    // Check authentication status
    checkAuth();

    // Simulate initial load
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [checkAuth]);

  if (loading) {
    return null; // Loading screen is in index.html
  }

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#151515',
            color: '#fff',
            border: '1px solid #00ff88',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#151515',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff006e',
              secondary: '#151515',
            },
          },
        }}
      />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
