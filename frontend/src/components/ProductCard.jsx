import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product, onFavoriteRemoved }) => {
  if (!product) return null;

  const { id, name, description, images, category, features, price } = product;
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  // Estado para el favorito
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener primera imagen o usar una imagen por defecto
  const imageUrl =
    images && images.length > 0
      ? images[0]
      : 'https://via.placeholder.com/350x240?text=Sin+imagen';

  // Truncar descripción para vista previa (máx. 80 caracteres para uniformidad)
  const truncatedDescription = description
    ? description.length > 80
      ? `${description.substring(0, 80)}...`
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
        if (!token) return;
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = tokenData.id;
        const response = await fetch(
          `http://localhost:8080/api/users/${tokenUserId}/favorites/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
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
            Authorization: `Bearer ${token}`,
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
      }
    } catch (error) {
      // Silenciar error visual
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="product-card improved-product-card">
      <div className="favorite-icon" onClick={handleFavoriteClick}>
        {isProcessing ? (
          <span className="favorite-loading">⌛</span>
        ) : isFavorite ? (
          <span className="favorite-filled" title="Quitar de favoritos">❤️</span>
        ) : (
          <span className="favorite-empty" title={isAuthenticated ? 'Añadir a favoritos' : 'Inicia sesión para añadir a favoritos'}>🤍</span>
        )}
      </div>
      <Link to={`/productos/${id}`} className="improved-product-image-link">
        <div className="improved-product-image">
          <img src={imageUrl} alt={name} loading="lazy" />
        </div>
      </Link>
      <div className="product-content improved-product-content">
        <Link to={`/productos/${id}`} className="product-title-link">
          <h3 className="product-title improved-product-title">{name}</h3>
        </Link>
        <p className="product-description improved-product-description">{truncatedDescription}</p>
        <div className="product-details improved-product-details">
          {category && <span className="product-category improved-product-category">{category.name}</span>}
          <span className="product-price improved-product-price">{formattedPrice}</span>
        </div>
        {features && features.length > 0 && (
          <div className="product-features improved-product-features">
            {features.slice(0, 3).map((feature) => (
              <span key={feature.id} className="feature-badge" title={feature.name}>
                {feature.icon}
              </span>
            ))}
            {features.length > 3 && (
              <span className="feature-badge feature-more">+{features.length - 3}</span>
            )}
          </div>
        )}
        <Link to={`/productos/${id}`} className="product-link improved-product-link">
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
