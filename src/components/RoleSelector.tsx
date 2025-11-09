import React, { useState } from 'react';
import { User } from '../types';
import { useData } from '../hooks/useDataContext';
import Card from './ui/Card';
import Button from './ui/Button';

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
                src="data:image/jpeg;base64,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"
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