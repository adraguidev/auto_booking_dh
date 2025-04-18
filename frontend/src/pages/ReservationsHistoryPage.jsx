import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './ReservationsHistoryPage.css';

const ReservationsHistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir si no hay usuario autenticado
    if (!currentUser) {
      navigate('/login?redirect=/reservas&msg=login_required');
      return;
    }

    // Cargar las reservas del usuario
    fetchReservations();
  }, [currentUser, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:8080/api/bookings/user/${currentUser.id}`,
        { headers: getAuthHeader() }
      );
      
      // Ordenar las reservas por fecha de inicio (descendente)
      const sortedReservations = response.data.sort((a, b) => 
        new Date(b.startDate) - new Date(a.startDate)
      );
      
      setReservations(sortedReservations);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
      setError('No se pudieron cargar tus reservas. Por favor, intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para determinar si una reserva ya pasó
  const isReservationPast = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(endDate) < today;
  };

  // Función para determinar si una reserva se puede cancelar
  const canCancelReservation = (reservation) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(reservation.startDate);
    return !isReservationPast(reservation.endDate) && 
           startDate > today && 
           reservation.status !== 'CANCELLED' &&
           reservation.status !== 'COMPLETED';
  };

  // Función para cancelar una reserva
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/bookings/${reservationId}/cancel`,
        {},
        { headers: getAuthHeader() }
      );

      if (response.status === 200) {
        // Actualizar la lista de reservas
        fetchReservations();
      }
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      setError('No se pudo cancelar la reserva. Por favor, intenta nuevamente más tarde.');
    }
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="reservations-loading">
        <h2>Cargando tus reservas...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservations-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="reservations-history-page">
      <div className="reservations-container">
        <h1>Mis Reservas</h1>
        
        {reservations.length === 0 ? (
          <div className="no-reservations">
            <p>No has realizado reservas todavía.</p>
            <Link to="/" className="browse-products-link">
              Explorar productos disponibles
            </Link>
          </div>
        ) : (
          <div className="reservations-list">
            {reservations.map((reservation) => (
              <div 
                key={reservation.id} 
                className={`reservation-card ${isReservationPast(reservation.endDate) ? 'past' : 'upcoming'}`}
              >
                <div className="reservation-header">
                  <div className="reservation-status">
                    {isReservationPast(reservation.endDate) ? (
                      <span className="status-badge completed">Completada</span>
                    ) : reservation.status === 'CANCELLED' ? (
                      <span className="status-badge cancelled">Cancelada</span>
                    ) : (
                      <span className="status-badge upcoming">Próxima</span>
                    )}
                  </div>
                  <div className="reservation-id">
                    <span>Reserva #{reservation.id}</span>
                  </div>
                </div>
                
                <div className="reservation-content">
                  <div className="product-info">
                    <div className="product-image">
                      {reservation.product.images && reservation.product.images.length > 0 ? (
                        <img 
                          src={reservation.product.images[0]} 
                          alt={reservation.product.name}
                        />
                      ) : (
                        <div className="no-image">Sin imagen</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h3 className="product-name">{reservation.product.name}</h3>
                      <p className="product-category">{reservation.product.category.name}</p>
                    </div>
                  </div>
                  
                  <div className="reservation-details">
                    <div className="date-info">
                      <div className="date-range">
                        <span className="date-label">Desde:</span>
                        <span className="date-value">{formatDate(reservation.startDate)}</span>
                      </div>
                      <div className="date-range">
                        <span className="date-label">Hasta:</span>
                        <span className="date-value">{formatDate(reservation.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="price-info">
                      <span className="price-label">Total:</span>
                      <span className="price-value">{formatPrice(reservation.totalPrice)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="reservation-footer">
                  <Link 
                    to={`/productos/${reservation.product.id}`}
                    className="view-details-button"
                  >
                    Ver detalles del producto
                  </Link>
                  
                  {canCancelReservation(reservation) && (
                    <button
                      className="cancel-button"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancelar reserva
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsHistoryPage; 