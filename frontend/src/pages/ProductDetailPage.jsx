import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar } from 'react-date-range';
import { es } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './ProductDetailPage.css';
import BookingForm from '../components/BookingForm';
import WhatsAppButton from '../components/WhatsAppButton';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // Función para manejar el clic en el botón de reserva
  const handleReserveClick = () => {
    if (isAuthenticated) {
      // Si el usuario está autenticado, redirigir a la página de reserva
      navigate(`/reserva/${id}`);
    } else {
      // Si no está autenticado, redirigir al login con parámetros para volver
      navigate(`/login?redirect=/reserva/${id}&msg=login_required_for_favorites`);
    }
  };
  
  // Cargar detalles del producto al montar el componente
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`http://localhost:8080/api/products/${id}`, {
          headers
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('No tienes permiso para ver este producto');
          }
          if (response.status === 404) {
            throw new Error('Producto no encontrado');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
        setError(error.message || 'No se pudo cargar el producto. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  // Función para cargar fechas no disponibles
  const fetchUnavailableDates = async () => {
    try {
      console.log('[DEBUG] Iniciando fetchUnavailableDates para producto:', id);
      const response = await fetch(`http://localhost:8080/api/products/${id}/unavailable-dates`);
      if (!response.ok) {
        throw new Error('Error al cargar las fechas no disponibles');
      }
      const data = await response.json();
      console.log('[DEBUG] Respuesta completa del backend:', JSON.stringify(data, null, 2));
      
      if (!data.unavailableDates || !Array.isArray(data.unavailableDates)) {
        console.error('[DEBUG] Formato de respuesta inesperado:', data);
        setUnavailableDates([]);
        return;
      }
      
      // Convertir las reservas a fechas individuales
      const allDates = data.unavailableDates.flatMap(item => {
        console.log('[DEBUG] Procesando item de fecha:', JSON.stringify(item, null, 2));
        try {
          if (item.type === 'single' && item.date) {
            // Para fechas individuales
            const date = new Date(item.date);
            console.log('[DEBUG] Procesando fecha individual:', date.toISOString().split('T')[0]);
            
            if (isNaN(date.getTime())) {
              console.error('[DEBUG] Fecha individual inválida:', item);
              return [];
            }
            
            return [date];
          } else if (item.type === 'range' && item.startDate && item.endDate) {
            // Para rangos de fechas
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            
            console.log('[DEBUG] Procesando rango de fechas (original):', {
              startOriginal: item.startDate,
              endOriginal: item.endDate
            });
            
            // Ajustar el desfase de zona horaria (el backend usa LocalDate que no tiene tiempo)
            // El desfase ocurre debido a la zona horaria. Necesitamos restar un día 
            // para compensar cómo Java LocalDate y JavaScript Date manejan las fechas
            const correctedStart = new Date(start);
            correctedStart.setDate(correctedStart.getDate() - 1);
            
            const correctedEnd = new Date(end);
            correctedEnd.setDate(correctedEnd.getDate() - 1);
            
            console.log('[DEBUG] Procesando rango de fechas (corregido con ajuste):', {
              startCorregido: correctedStart.toISOString().split('T')[0],
              endCorregido: correctedEnd.toISOString().split('T')[0]
            });
            
            if (isNaN(correctedStart.getTime()) || isNaN(correctedEnd.getTime())) {
              console.error('[DEBUG] Rango de fechas inválido:', item);
              return [];
            }
            
            // Generar todas las fechas en el rango
            const dates = [];
            const current = new Date(correctedStart);
            while (current <= correctedEnd) {
              dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
            console.log('[DEBUG] Fechas generadas para el rango:', 
              dates.map(d => d.toISOString().split('T')[0]));
            return dates;
          } else {
            console.error('[DEBUG] Formato de fecha no reconocido:', item);
            return [];
          }
        } catch (error) {
          console.error('[DEBUG] Error al procesar fecha:', item, error);
          return [];
        }
      });
      
      console.log('[DEBUG] Total de fechas procesadas:', allDates.length);
      console.log('[DEBUG] Fechas a marcar como no disponibles:', 
        allDates.map(d => d.toISOString().split('T')[0]));
      setUnavailableDates(allDates);
    } catch (error) {
      console.error('[DEBUG] Error al cargar fechas no disponibles:', error);
      setAvailabilityError('No se pudo cargar la disponibilidad. Intenta refrescar la página.');
    }
  };
  
  // Cargar fechas no disponibles cuando cambia el productId
  useEffect(() => {
    if (id) {
      fetchUnavailableDates();
    }
  }, [id]);
  
  // Función para deshabilitar fechas no disponibles en el calendario
  const isDateBlocked = (date) => {
    if (!date) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Comprobamos si alguna de las fechas no disponibles coincide con la fecha actual
    const isBlocked = unavailableDates.some(unavailableDate => {
      const unavailableDateStr = unavailableDate.toISOString().split('T')[0];
      const matches = unavailableDateStr === dateStr;
      
      if (matches) {
        console.log('[DEBUG] Fecha coincide y está bloqueada:', dateStr);
      }
      
      return matches;
    });
    
    if (isBlocked) {
      console.log('[DEBUG] Fecha bloqueada final:', dateStr);
    }
    
    return isBlocked;
  };
  
  // Función para manejar el cambio en la fecha seleccionada
  const handleDateChange = (ranges) => {
    if (ranges.length > 0) {
      setStartDate(ranges[0].startDate);
      setEndDate(ranges[0].endDate);
    }
  };
  
  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="product-detail-loading">
        <h2>Cargando producto...</h2>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Volver a la página principal</Link>
      </div>
    );
  }
  
  // Si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/" className="back-link">Volver a la página principal</Link>
      </div>
    );
  }
  
  // Desestructurar propiedades del producto
  const { name, description, images, category, features, price } = product;
  
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="breadcrumb">
          <Link to="/">Inicio</Link> {' > '}
          {category && <Link to={`/?categoryId=${category.id}`}>{category.name}</Link>}
          {' > '} {name}
        </div>
        
        <div className="product-detail-content">
          <div className="product-detail-left">
            <div className="product-detail-images">
              {images && images.length > 0 ? (
                <div className="main-image">
                  <img src={images[0]} alt={name} />
                </div>
              ) : (
                <div className="main-image no-image">
                  <img src="https://via.placeholder.com/600x400?text=Sin+imagen" alt="Sin imagen" />
                </div>
              )}
              
              {images && images.length > 1 && (
                <div className="thumbnail-images">
                  {images.slice(1).map((image, index) => (
                    <div key={index} className="thumbnail">
                      <img src={image} alt={`${name} vista ${index + 2}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="product-detail-info">
              <h1 className="product-title">{name}</h1>
              
              {/* Botón de reserva destacado */}
              <button 
                className="reserve-button"
                onClick={handleReserveClick}
              >
                Reservar
              </button>
              
              {category && (
                <div className="product-category">
                  <span className="category-badge">{category.name}</span>
                </div>
              )}
              
              {features && features.length > 0 && (
                <div className="product-features">
                  <h3>Características</h3>
                  <div className="features-grid">
                    {features.map(feature => (
                      <div key={feature.id} className="feature-item">
                        <span className="feature-icon">{feature.icon}</span>
                        <span className="feature-name">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="product-description">
                <h3>Descripción</h3>
                <p>{description || 'Sin descripción disponible'}</p>
              </div>
              
              <div className="product-policies">
                <h3>Políticas de Uso</h3>
                <div className="policies-grid">
                  <div className="policy-item">
                    <h4>Normas</h4>
                    <ul>
                      <li>Conductor con licencia válida</li>
                      <li>Edad mínima de 21 años</li>
                      <li>Prohibido fumar en el vehículo</li>
                    </ul>
                  </div>
                  
                  <div className="policy-item">
                    <h4>Seguridad</h4>
                    <ul>
                      <li>Vehículo con seguro incluido</li>
                      <li>Dispositivo de geolocalización</li>
                      <li>Asistencia en carretera 24/7</li>
                    </ul>
                  </div>
                  
                  <div className="policy-item">
                    <h4>Cancelación</h4>
                    <ul>
                      <li>Cancelación gratuita hasta 48 horas antes</li>
                      <li>Reembolso del 50% hasta 24 horas antes</li>
                      <li>Sin reembolso con menos de 24 horas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="product-detail-right">
            <div className="availability-section">
              <h3>Disponibilidad</h3>
              
              {availabilityError ? (
                <div className="availability-error">
                  <p>{availabilityError}</p>
                  <button 
                    className="retry-button" 
                    onClick={fetchUnavailableDates}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="calendar-container">
                  <Calendar
                    date={new Date()}
                    minDate={new Date()}
                    color="#0077b6"
                    locale={es}
                    onChange={handleDateChange}
                    disabledDay={isDateBlocked}
                    ranges={[
                      {
                        startDate: startDate,
                        endDate: endDate,
                        key: 'selection',
                        color: '#0077b6'
                      }
                    ]}
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
                  </div>
                </div>
              )}
              
              {/* Formulario de Reserva */}
              <BookingForm product={product} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón de WhatsApp */}
      <WhatsAppButton productName={name} />
    </div>
  );
};

export default ProductDetailPage; 