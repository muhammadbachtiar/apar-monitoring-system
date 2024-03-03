import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import isTokenValid from "./IsTokenValid";
import useAuth from "./useContext";

const PrivateRoutes = () => {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setTokenValid(false);
      return;
    }

    const checkToken = async () => {
      const isValid = await isTokenValid(token);
    
      if (typeof isValid === 'object' && isValid !== null && 'status' in isValid) {
        setTokenValid(isValid.status);
        login(isValid.role, isValid.name);
      } else {
        setTokenValid(false);
      }
    };

    checkToken(); 
  }, []); 

  if (tokenValid === null) {
    return <div>Loading...</div>;
  }

  return tokenValid ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
