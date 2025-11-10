import React, { useState } from 'react';
import { User } from '../types';
import { useData } from '../hooks/useDataContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { LOGO_DATA_URI } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { authenticateUser } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        const user = authenticateUser(username, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid username or password.');
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <div className="text-center mb-6">
            <img 
                src={LOGO_DATA_URI}
                alt="FGBMFI Logo" 
                className="mx-auto h-24 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-slate-900">Login</h2>
            <p className="text-slate-500">Please enter your credentials to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md shadow-sm"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="relative">
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md shadow-sm"
              required
              autoComplete="current-password"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
            >
                {showPassword ? <EyeSlashIcon className="h-6 w-6 text-slate-400"/> : <EyeIcon className="h-6 w-6 text-slate-400"/>}
            </button>
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md text-center">{error}</p>}

          <Button type="submit" isLoading={isLoading} disabled={!username || !password || isLoading} className="w-full">
            {isLoading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;