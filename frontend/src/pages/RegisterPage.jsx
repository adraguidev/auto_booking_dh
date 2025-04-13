import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    
    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)) {
      newErrors.password = 'La contraseña debe incluir al menos una letra y un número';
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
      console.log('Enviando datos al servidor:', formData);
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      if (response.ok) {
        setSuccessMessage('Registro exitoso. Ahora puede iniciar sesión.');
        
        // Limpiar formulario
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        });
        
        // Redireccionar después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Manejar errores de validación del servidor
        if (data.error) {
          console.error('Error del servidor:', data.error);
          if (data.error.includes('email')) {
            setErrors(prev => ({ ...prev, email: data.error }));
          } else if (data.error.includes('contraseña')) {
            setErrors(prev => ({ ...prev, password: data.error }));
          } else if (data.error.includes('nombre')) {
            setErrors(prev => ({ ...prev, firstName: data.error }));
          } else if (data.error.includes('apellido')) {
            setErrors(prev => ({ ...prev, lastName: data.error }));
          } else {
            setErrors(prev => ({ ...prev, server: data.error }));
          }
        } else {
          setErrors(prev => ({ ...prev, server: 'Error al registrar. Intente nuevamente.' }));
        }
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setErrors(prev => ({ 
        ...prev, 
        server: 'Error de conexión. Verifique su conexión a internet e intente nuevamente.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Crear Cuenta</h1>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {errors.server && (
          <div className="error-message server-error">
            {errors.server}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="firstName">Nombre</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
              autoComplete="given-name"
            />
            {errors.firstName && <div className="input-error">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Apellido</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ingrese su apellido"
              autoComplete="family-name"
            />
            {errors.lastName && <div className="input-error">{errors.lastName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
            />
            {errors.email && <div className="input-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
            <div className="password-requirements">
              Mínimo 6 caracteres, incluyendo al menos una letra y un número
            </div>
            {errors.password && <div className="input-error">{errors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 