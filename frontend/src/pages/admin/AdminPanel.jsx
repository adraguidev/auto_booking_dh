import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  
  // Verificar que el usuario esté autenticado y sea administrador
  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/administracion&msg=login_required');
      return;
    }
    
    if (!isAdmin()) {
      // Si no es admin, redirigir a la página principal con mensaje
      navigate('/', { state: { message: 'No tienes permisos para acceder al panel de administración' } });
    }
  }, [currentUser, isAdmin, navigate]);
  
  // Verificar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Comprobar al montar el componente
    checkIfMobile();
    
    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar event listener al desmontar
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Redireccionar a la lista de productos si estamos en la ruta /administracion exacta
  useEffect(() => {
    if (location.pathname === '/administracion') {
      navigate('/admin/productos');
    }
  }, [location.pathname, navigate]);
  
  // Si no está autenticado o no es admin, no renderizar nada (lo manejará el useEffect)
  if (!currentUser || !isAdmin()) {
    return null;
  }
  
  // Si es móvil, mostrar mensaje de no disponible
  if (isMobile) {
    return (
      <div className="mobile-message">
        <h2>Panel de administración no disponible en móvil</h2>
        <p>Por favor use un dispositivo de mayor tamaño.</p>
      </div>
    );
  }
  
  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Panel Admin</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li className={location.pathname.includes('/admin/productos') && !location.pathname.includes('/nuevo') ? 'active' : ''}>
              <Link to="/admin/productos">Lista de productos</Link>
            </li>
            <li className={location.pathname.includes('/admin/productos/nuevo') ? 'active' : ''}>
              <Link to="/admin/productos/nuevo">Agregar producto</Link>
            </li>
            <li className={location.pathname.includes('/admin/categorias') ? 'active' : ''}>
              <Link to="/admin/categorias">Categorías</Link>
            </li>
            <li className={location.pathname.includes('/admin/caracteristicas') ? 'active' : ''}>
              <Link to="/admin/caracteristicas">Características</Link>
            </li>
          </ul>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="back-to-site">Volver al sitio</Link>
        </div>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPanel; 