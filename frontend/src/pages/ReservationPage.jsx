import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DateRange } from 'react-date-range';
import { es } from 'date-fns/locale';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './ReservationPage.css';

const ReservationPage = () => {
  const { productId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para las fechas seleccionadas
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: 'selection'
    }
  ]);
  
  // Comprobar si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate(`/login?redirect=/reserva/${productId}&msg=login_required_for_favorites`);
    }
  }, [isAuthenticated, currentUser, navigate, productId]);
  
  // Cargar detalles del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar producto: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
        setError('No se pudo cargar el producto. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);
  
  // Cargar fechas no disponibles
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/products/${productId}/unavailable-dates`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar fechas no disponibles: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convertir las fechas a objetos Date para el calendario
        const unavailableDateObjects = [];
        
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach(item => {
            if (item.type === 'single' && item.date) {
              // Es una fecha individual
              unavailableDateObjects.push(new Date(item.date));
            } else if (item.type === 'range' && item.startDate && item.endDate) {
              // Es un rango de fechas
              const start = new Date(item.startDate);
              const end = new Date(item.endDate);
              
              // Añadir todas las fechas dentro del rango
              const currentDate = new Date(start);
              while (currentDate <= end) {
                unavailableDateObjects.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          });
        }
        
        setUnavailableDates(unavailableDateObjects);
      } catch (error) {
        console.error('Error al cargar fechas no disponibles:', error);
      }
    };
    
    if (productId) {
      fetchUnavailableDates();
    }
  }, [productId]);
  
  // Función para deshabilitar fechas no disponibles en el calendario
  const isDateBlocked = (date) => {
    return unavailableDates.some(unavailableDate => 
      date.getDate() === unavailableDate.getDate() &&
      date.getMonth() === unavailableDate.getMonth() &&
      date.getFullYear() === unavailableDate.getFullYear()
    );
  };
  
  // Calculando precio total
  const calculateTotalPrice = () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate || !product || !product.price) {
      return 0;
    }
    
    const diffTime = Math.abs(dateRange[0].endDate - dateRange[0].startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * product.price;
  };
  
  // Formatear precio para mostrar
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  // Manejar cambios en la selección de fechas
  const handleDateChange = (ranges) => {
    // Validar que no incluya fechas no disponibles
    const start = new Date(ranges.selection.startDate);
    const end = new Date(ranges.selection.endDate);
    let currentDate = new Date(start);
    
    // Verificar que cada fecha en el rango esté disponible
    while (currentDate <= end) {
      if (isDateBlocked(currentDate)) {
        // Si alguna fecha está bloqueada, no actualizar el rango
        return;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Si todas las fechas están disponibles, actualizar el rango
    setDateRange([ranges.selection]);
  };
  
  // Manejar clic en el botón de confirmar
  const handleConfirmClick = () => {
    // Por ahora solo mostraremos un mensaje
    alert("Próximamente: Aquí procesaremos la confirmación de reserva.");
    // En el siguiente prompt implementaremos la funcionalidad real
  };
  
  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="reservation-loading">
        <h2>Cargando datos para la reserva...</h2>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="reservation-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Volver a la página principal</Link>
      </div>
    );
  }
  
  // Si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <div className="reservation-not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que intentas reservar no existe o ha sido eliminado.</p>
        <Link to="/" className="back-link">Volver a la página principal</Link>
      </div>
    );
  }
  
  // Verificar si se seleccionaron fechas
  const isDateRangeValid = dateRange[0].startDate && dateRange[0].endDate;
  const totalPrice = calculateTotalPrice();

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <h1>Reserva de Producto</h1>
        
        <p className="reservation-instruction">Complete los siguientes datos para reservar:</p>
        
        <div className="reservation-content">
          <div className="reservation-left">
            {/* Información del producto */}
            <div className="product-summary">
              <h2>Tu reserva</h2>
              <div className="product-summary-info">
                <div className="product-summary-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <img src="https://via.placeholder.com/100x100?text=Sin+imagen" alt="Sin imagen" />
                  )}
                </div>
                <div className="product-summary-details">
                  <h3>{product.name}</h3>
                  {product.category && <p className="product-category">{product.category.name}</p>}
                  <p className="product-price">
                    Precio por día: {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Información del usuario */}
            <div className="user-summary">
              <h2>Tus datos</h2>
              <div className="user-info">
                <p><strong>Nombre:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
              </div>
            </div>
          </div>
          
          <div className="reservation-right">
            {/* Selector de fechas */}
            <div className="date-selection">
              <h2>Selecciona las fechas</h2>
              <DateRange
                editableDateInputs={true}
                onChange={handleDateChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                months={1}
                direction="horizontal"
                rangeColors={["#0077b6"]}
                minDate={new Date()}
                locale={es}
                disabledDates={unavailableDates}
              />
              
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-color available"></span>
                  <span className="legend-text">Disponible</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color unavailable"></span>
                  <span className="legend-text">No disponible</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color selected"></span>
                  <span className="legend-text">Seleccionado</span>
                </div>
              </div>
              
              {isDateRangeValid && (
                <div className="date-summary">
                  <p>
                    <strong>Desde:</strong> {format(dateRange[0].startDate, 'dd/MM/yyyy')}
                  </p>
                  <p>
                    <strong>Hasta:</strong> {format(dateRange[0].endDate, 'dd/MM/yyyy')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Resumen de precios */}
            {isDateRangeValid && totalPrice > 0 && (
              <div className="price-summary">
                <h2>Resumen</h2>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Precio diario:</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="price-row">
                    <span>Número de días:</span>
                    <span>{Math.ceil(Math.abs(dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Botón de confirmar */}
            <button
              className="confirm-reservation-button"
              disabled={!isDateRangeValid}
              onClick={handleConfirmClick}
            >
              Confirmar Reserva
            </button>
            
            {!isDateRangeValid && (
              <p className="dates-required-message">
                Por favor, selecciona las fechas para tu reserva.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage; 