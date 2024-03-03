import { useContext } from 'react';
import { AuthContext } from './AuthContext';

interface AuthContextProps {
    userRole: string;
    userName: string;
    login: (role: string, name:string) => void;
    logout: () => void;
  }

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
