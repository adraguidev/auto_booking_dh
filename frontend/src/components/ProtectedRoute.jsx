import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  // Si el usuario no está autenticado, redirigir a login
  if (!currentUser) {
    return <Navigate to={`/login?redirect=${location.pathname}&msg=login_required`} />;
  }
  
  // Si se requiere rol de admin y el usuario no es admin, redirigir a home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" />;
  }
  
  // Si todo está en orden, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 