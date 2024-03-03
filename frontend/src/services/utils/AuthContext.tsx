// AuthContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface AuthContextProps {
  userRole: string;
  userName: string;
  login: (role: string, name:string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  const login = (role: string, name: string) => {
    setUserRole(role);
    setUserName(name)
  };

  const logout = () => {
    setUserRole('');
    setUserName('');
  };

  return (
    <AuthContext.Provider value={{ userRole, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
