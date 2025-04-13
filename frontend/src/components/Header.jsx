import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
          <Link to="/administracion" className="admin-link">Panel Admin</Link>
          <Link to="/registro" className="auth-button">Crear cuenta</Link>
          <Link to="/login" className="auth-button">Iniciar sesión</Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 