import React from 'react';
import { User } from '../types';
import Button from './ui/Button';
import { LOGO_DATA_URI } from '../constants';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Logo: React.FC = () => (
    <div className="flex items-center gap-3">
        <img 
            src={LOGO_DATA_URI}
            alt="FGBMFI Logo" 
            className="h-12 w-auto"
        />
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">FGBMFI-NG LOF</h1>
            <p className="text-xs sm:text-sm text-slate-500">SW7 District Reporting</p>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
            <Logo />
            {user && (
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-slate-700">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.role}</p>
                    </div>
                    <Button onClick={onLogout} variant="secondary" className="text-sm">Logout</Button>
                </div>
            )}
        </div>
    </header>
  );
};

export default Header;