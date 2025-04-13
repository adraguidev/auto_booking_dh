import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  if (!product) return null;
  
  const { id, name, description, images, category, features, price } = product;
  const { isAuthenticated, user } = useAuth();
  
  // Estado para el favorito
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Obtener primera imagen o usar una imagen por defecto
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : 'https://via.placeholder.com/300x200?text=Sin+imagen';
  
  // Truncar descripción para vista previa
  const truncatedDescription = description 
    ? description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description
    : 'Sin descripción disponible';

  // Formatear precio
  const formattedPrice = price 
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)
    : 'Precio no disponible';

  // Verificar si el producto está en favoritos al cargar
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkFavorite = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.isFavorite);
          }
        } catch (error) {
          console.error('Error al verificar favorito:', error);
        }
      };
      
      checkFavorite();
    }
  }, [id, isAuthenticated, user]);

  // Manejar clic en favorito
  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // Evitar navegación
    e.stopPropagation(); // Evitar que el evento se propague
    
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      window.location.href = `/login?redirect=${window.location.pathname}&msg=login_required_for_favorites`;
      return;
    }
    
    if (isProcessing) return; // Evitar múltiples clics
    
    setIsProcessing(true);
    
    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Agregar a favoritos
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ productId: id })
        });
        
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="product-card">
      <div className="favorite-icon" onClick={handleFavoriteClick}>
        {isProcessing ? (
          <span className="favorite-loading">⌛</span>
        ) : isFavorite ? (
          <span className="favorite-filled" title="Quitar de favoritos">❤️</span>
        ) : (
          <span className="favorite-empty" title={isAuthenticated ? "Añadir a favoritos" : "Inicia sesión para añadir a favoritos"}>🤍</span>
        )}
      </div>
      
      <Link to={`/productos/${id}`} className="product-image-link">
        <div className="product-image">
          <img src={imageUrl} alt={name} />
        </div>
      </Link>
      
      <div className="product-content">
        <Link to={`/productos/${id}`} className="product-title-link">
          <h3 className="product-title">{name}</h3>
        </Link>
        
        <p className="product-description">{truncatedDescription}</p>
        
        <div className="product-details">
          {category && (
            <span className="product-category">{category.name}</span>
          )}
          
          <span className="product-price">{formattedPrice}</span>
        </div>
        
        {features && features.length > 0 && (
          <div className="product-features">
            {features.slice(0, 3).map(feature => (
              <span key={feature.id} className="feature-badge" title={feature.name}>
                {feature.icon}
              </span>
            ))}
            {features.length > 3 && (
              <span className="feature-badge feature-more">+{features.length - 3}</span>
            )}
          </div>
        )}
        
        <Link to={`/productos/${id}`} className="product-link">
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard; 