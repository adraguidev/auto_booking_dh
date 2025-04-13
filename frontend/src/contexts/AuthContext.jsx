import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al iniciar sesión');
      }
      
      const data = await response.json();
      
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.token);
      
      // Guardar datos del usuario en localStorage y en estado
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return currentUser && currentUser.isAdmin;
  };

  // Obtener las iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!currentUser) return '';
    
    const firstInitial = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = currentUser.lastName ? currentUser.lastName.charAt(0).toUpperCase() : '';
    
    return `${firstInitial}${lastInitial}`;
  };

  // Obtener el nombre completo del usuario
  const getFullName = () => {
    if (!currentUser) return '';
    return `${currentUser.firstName} ${currentUser.lastName}`;
  };

  // Función para obtener el token para hacer solicitudes autenticadas
  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    getUserInitials,
    getFullName,
    getAuthHeader,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 