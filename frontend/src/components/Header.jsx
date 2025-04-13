import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, getUserInitials, getFullName, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          avatarRef.current && !avatarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-container">
            <h1 className="logo">AutoBooking</h1>
            <span className="slogan">Tu reserva de autos</span>
          </Link>
        </div>
        <div className="header-right">
          {isAdmin() && (
            <Link to="/administracion" className="admin-link">Panel Admin</Link>
          )}
          
          {currentUser ? (
            <div className="user-area">
              <div 
                className="user-avatar" 
                onClick={toggleMenu}
                ref={avatarRef}
                title={getFullName()}
              >
                {getUserInitials()}
              </div>
              
              {menuOpen && (
                <div className="user-menu" ref={menuRef}>
                  <div className="user-menu-header">
                    <span className="user-name">{getFullName()}</span>
                    <span className="user-email">{currentUser.email}</span>
                  </div>
                  <ul className="user-menu-items">
                    <li className="user-menu-item">
                      <Link to="/perfil" onClick={() => setMenuOpen(false)}>Mi Perfil</Link>
                    </li>
                    <li className="user-menu-item">
                      <Link to="/favoritos" onClick={() => setMenuOpen(false)}>Mis Favoritos</Link>
                    </li>
                    <li className="user-menu-item">
                      <Link to="/reservas" onClick={() => setMenuOpen(false)}>Mis Reservas</Link>
                    </li>
                    <li className="user-menu-item logout">
                      <button onClick={handleLogout}>Cerrar sesión</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/registro" className="auth-button">Crear cuenta</Link>
              <Link to="/login" className="auth-button">Iniciar sesión</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 