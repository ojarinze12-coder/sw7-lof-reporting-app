
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { DataProvider } from './hooks/useDataContext';
import Login from './components/RoleSelector';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setLoggedInUser(user);
  };
  
  const handleLogout = () => {
    setLoggedInUser(null);
  };

  return (
    <DataProvider>
      <HashRouter>
        <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
          <Header user={loggedInUser} onLogout={handleLogout} />
          <main className="p-4 sm:p-6 md:p-8">
            <Routes>
              <Route 
                path="/login" 
                element={loggedInUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/" 
                element={loggedInUser ? <Dashboard user={loggedInUser} /> : <Navigate to="/login" />} 
              />
              <Route path="*" element={<Navigate to={loggedInUser ? "/" : "/login"} />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;