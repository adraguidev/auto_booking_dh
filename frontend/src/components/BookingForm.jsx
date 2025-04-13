import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale';
import { addDays, format } from 'date-fns';
import './BookingForm.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BookingForm = ({ product }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Calcular precio total cuando cambian las fechas
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Verificar que las fechas sean válidas
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Calcular diferencia en días
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calcular precio total (días * precio por día del producto)
        const price = diffDays * product.price;
        setTotalPrice(price);
      }
    }
  }, [startDate, endDate, product.price]);
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }
    
    if (!endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        newErrors.startDate = 'La fecha de inicio no puede ser en el pasado';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Enviar datos de la reserva al backend
      const response = await axios.post('http://localhost:8080/api/bookings', {
        productId: product.id,
        userId: user.id,
        startDate,
        endDate,
        totalPrice
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        setSuccessMessage('¡Reserva realizada con éxito! Recibirás un correo de confirmación pronto.');
        setStartDate('');
        setEndDate('');
      }
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      
      if (error.response) {
        setErrors({
          submit: error.response.data.message || 'Error al procesar la reserva. Por favor, inténtalo de nuevo.'
        });
      } else {
        setErrors({
          submit: 'No se pudo conectar con el servidor. Por favor, inténtalo más tarde.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Formatear precio para mostrar
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  return (
    <div className="booking-form-container">
      <h3>Reservar este producto</h3>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
      
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="date-fields">
          <div className="form-group">
            <label htmlFor="startDate">Fecha de inicio</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={errors.startDate ? 'error' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.startDate && <span className="error-text">{errors.startDate}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">Fecha de fin</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={errors.endDate ? 'error' : ''}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            {errors.endDate && <span className="error-text">{errors.endDate}</span>}
          </div>
        </div>
        
        {startDate && endDate && totalPrice > 0 && (
          <div className="price-summary">
            <div className="price-detail">
              <span>Precio total</span>
              <span className="total-price">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          className="booking-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar reserva'}
        </button>
        
        {!isAuthenticated && (
          <p className="login-required-notice">
            Necesitas iniciar sesión para realizar una reserva.
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm; 