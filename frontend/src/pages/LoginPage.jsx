import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Verificar si hay un redirect en la URL
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';
  const msgParam = searchParams.get('msg');
  
  // Determinar qué mensaje mostrar según el parámetro msgParam
  const showLoginRequiredMessage = msgParam === 'login_required';
  const showLoginRequiredForFavorites = msgParam === 'login_required_for_favorites';
  
  const getLoginMessage = () => {
    if (showLoginRequiredMessage) {
      return 'Debes iniciar sesión para continuar. Si no tienes cuenta, regístrate.';
    }
    if (showLoginRequiredForFavorites) {
      return 'Debes iniciar sesión para realizar una reserva. Si no tienes cuenta, regístrate.';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      
      // Redireccionar según el parámetro redirect
      navigate(redirect);
      
    } catch (error) {
      setErrors({ server: error.message || 'Error al iniciar sesión. Verifica tus credenciales.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        
        {getLoginMessage() && (
          <div className="login-required-message">
            {getLoginMessage()}
          </div>
        )}
        
        {errors.server && (
          <div className="error-message server-error">
            {errors.server}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({...errors, email: ''});
                }
              }}
              placeholder="Ingresa tu email"
              autoComplete="email"
            />
            {errors.email && <div className="input-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({...errors, password: ''});
                }
              }}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
            {errors.password && <div className="input-error">{errors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <div className="register-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 