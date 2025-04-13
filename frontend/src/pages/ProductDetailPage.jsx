import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar } from 'react-date-range';
import { es } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './ProductDetailPage.css';
import BookingForm from '../components/BookingForm';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  
  // Cargar detalles del producto al montar el componente
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
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
    
    fetchProductDetails();
  }, [id]);
  
  // Cargar fechas no disponibles
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setAvailabilityError(null);
        const response = await fetch(`http://localhost:8080/api/products/${id}/unavailable-dates`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convertir las fechas a objetos Date para el calendario
        // Ahora manejamos dos posibles formatos: fechas individuales y rangos
        const unavailableDateObjects = [];
        
        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach(item => {
            if (item.date) {
              // Es una fecha individual
              unavailableDateObjects.push(new Date(item.date));
            } else if (item.startDate && item.endDate) {
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
        setAvailabilityError('No se pudo cargar la disponibilidad. Intenta refrescar la página.');
      }
    };
    
    if (id) {
      fetchUnavailableDates();
    }
  }, [id]);
  
  // Función para reintentar cargar las fechas no disponibles
  const handleRetryLoading = () => {
    if (id) {
      const fetchUnavailableDates = async () => {
        try {
          setAvailabilityError(null);
          const response = await fetch(`http://localhost:8080/api/products/${id}/unavailable-dates`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Convertir las fechas a objetos Date para el calendario
          // Ahora manejamos dos posibles formatos: fechas individuales y rangos
          const unavailableDateObjects = [];
          
          if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
            data.unavailableDates.forEach(item => {
              if (item.date) {
                // Es una fecha individual
                unavailableDateObjects.push(new Date(item.date));
              } else if (item.startDate && item.endDate) {
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
          setAvailabilityError('No se pudo cargar la disponibilidad. Intenta refrescar la página.');
        }
      };
      
      fetchUnavailableDates();
    }
  };
  
  // Función para deshabilitar fechas no disponibles en el calendario
  const disableDates = (date) => {
    return unavailableDates.some(unavailableDate => 
      date.getDate() === unavailableDate.getDate() &&
      date.getMonth() === unavailableDate.getMonth() &&
      date.getFullYear() === unavailableDate.getFullYear()
    );
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
                    onClick={handleRetryLoading}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="calendar-container">
                  <Calendar
                    date={new Date()}
                    minDate={new Date()}
                    disabledDates={disableDates}
                    color="#0077b6"
                    locale={es}
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
    </div>
  );
};

export default ProductDetailPage; 