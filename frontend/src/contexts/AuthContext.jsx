import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');
        
        console.log('Cargando datos de usuario:', { storedUser, storedToken });
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuario parseado:', parsedUser);
          if (parsedUser && parsedUser.id) {
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            console.error('Datos de usuario inválidos:', parsedUser);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('No se encontraron datos de usuario en localStorage');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      console.log('Iniciando sesión con:', { email });
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
      console.log('Datos de login recibidos:', data);
      
      if (!data.user || !data.token || !data.user.id) {
        throw new Error('Datos de usuario o token no recibidos del servidor o son inválidos');
      }
      
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.token);
      
      // Guardar datos del usuario en localStorage y en estado
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      
      console.log('Sesión iniciada correctamente:', { user: data.user, isAuthenticated: true });
      
      return data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    console.log('Sesión cerrada');
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
    loading,
    isAuthenticated
  };

  console.log('Estado actual de AuthContext:', {
    currentUser,
    isAuthenticated,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 