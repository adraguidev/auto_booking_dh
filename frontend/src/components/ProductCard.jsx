import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product, onFavoriteRemoved }) => {
  if (!product) return null;

  const { id, name, description, images, category, features, price } = product;
  const { currentUser, getAuthHeader } = useAuth();
  const isAuthenticated = !!currentUser;

  // Estado para el favorito
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener primera imagen o usar una imagen por defecto
  const imageUrl =
    images && images.length > 0
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
    ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(price)
    : 'Precio no disponible';

  // Verificar si el producto está en favoritos al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !currentUser?.id || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          window.location.href = `/login?redirect=${window.location.pathname}`;
          return;
        }

        // Decodificar el token para obtener el ID del usuario
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = tokenData.id;

        const response = await fetch(
          `http://localhost:8080/api/users/${tokenUserId}/favorites/${id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        } else if (response.status === 401) {
          // Token expirado o inválido
          window.location.href = `/login?redirect=${window.location.pathname}`;
        } else if (response.status === 403) {
          // No tiene permiso para acceder a los favoritos
          console.error('No tienes permiso para acceder a los favoritos');
          setIsFavorite(false);
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error);
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [id, isAuthenticated, currentUser?.id]);

  // Manejar clic en favorito
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !currentUser?.id) {
      window.location.href = `/login?redirect=${window.location.pathname}&msg=login_required_for_favorites`;
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return;
    }

    // Decodificar el token para obtener el ID del usuario
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const tokenUserId = tokenData.id;

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${tokenUserId}/favorites`,
        {
          method: isFavorite ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: isFavorite ? null : JSON.stringify({ productId: id })
        }
      );

      if (response.ok) {
        setIsFavorite(!isFavorite);
        if (isFavorite && onFavoriteRemoved) {
          onFavoriteRemoved(id);
        }
      } else if (response.status === 401) {
        // Token expirado o inválido
        window.location.href = `/login?redirect=${window.location.pathname}`;
      } else if (response.status === 403) {
        // No tiene permiso para acceder a los favoritos
        console.error('No tienes permiso para acceder a los favoritos');
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar favorito:', errorData.error);
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
          <span className="favorite-filled" title="Quitar de favoritos">
            ❤️
          </span>
        ) : (
          <span
            className="favorite-empty"
            title={
              isAuthenticated
                ? 'Añadir a favoritos'
                : 'Inicia sesión para añadir a favoritos'
            }
          >
            🤍
          </span>
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
            {features.slice(0, 3).map((feature) => (
              <span
                key={feature.id}
                className="feature-badge"
                title={feature.name}
              >
                {feature.icon}
              </span>
            ))}
            {features.length > 3 && (
              <span className="feature-badge feature-more">
                +{features.length - 3}
              </span>
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
