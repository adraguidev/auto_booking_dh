import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favoritos' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Cargar favoritos
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar favoritos');
        }
        
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Error al obtener favoritos:', error);
        setError('No se pudieron cargar tus productos favoritos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, user]);
  
  // Manejar eliminación de favorito
  const handleFavoriteRemoved = (productId) => {
    setFavorites(prev => prev.filter(product => product.id !== productId));
  };
  
  // Si el usuario no está autenticado, no renderizar nada (la redirección lo manejará)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <h1 className="favorites-title">Mis Favoritos</h1>
        
        {loading ? (
          <div className="favorites-loading">
            <p>Cargando productos favoritos...</p>
          </div>
        ) : error ? (
          <div className="favorites-error">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-empty">
            <p>No tienes productos favoritos aún.</p>
            <button 
              className="browse-button"
              onClick={() => navigate('/')}
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <>
            <p className="favorites-count">
              {favorites.length === 1 ? 
                'Tienes 1 producto favorito' : 
                `Tienes ${favorites.length} productos favoritos`}
            </p>
            
            <div className="favorites-grid">
              {favorites.map(product => (
                <div key={product.id} className="favorite-item">
                  <ProductCard 
                    product={product} 
                    onFavoriteRemoved={() => handleFavoriteRemoved(product.id)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 