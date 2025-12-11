import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token no localStorage ao carregar a aplicação
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data.user);
      } catch (error) {
        // Token inválido, remover do localStorage
        localStorage.removeItem('authToken');
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []); // Array vazio garante que executa apenas uma vez

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  };setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};