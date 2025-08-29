
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'client' | 'business' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'client' | 'business' | 'employee') => Promise<void>;
  register: (email: string, password: string, role: 'client' | 'business') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'client' | 'business' | 'employee') => {
    // Simulate authentication - in real app, this would call your backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, role: 'client' | 'business') => {
    // Simulate registration - in real app, this would call your backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
