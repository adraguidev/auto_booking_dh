import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener el producto:', err);
        setError('No se pudo cargar la información del producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageClick = (index) => {
    setActiveImage(index);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="product-detail-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando información del producto...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="product-detail-container">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || 'No se encontró el producto solicitado'}</p>
            <Link to="/" className="btn-back">Volver al inicio</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="product-detail-container">
        <div className="product-detail-wrapper">
          {/* Galería de imágenes */}
          <div className="product-gallery">
            <div className="main-image">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[activeImage]} alt={product.name} />
              ) : (
                <div className="no-image">No hay imagen disponible</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img src={image} alt={`Miniatura ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            {product.category && (
              <div className="product-category">
                <span className="category-label">Categoría:</span>
                <span className="category-value">{product.category.name}</span>
              </div>
            )}

            <div className="product-description">
              <h2>Descripción</h2>
              <p>{product.description}</p>
            </div>

            {/* Bloque de características */}
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h2 className="features-title">Características</h2>
                <div className="features-grid">
                  {product.features.map(feature => (
                    <div key={feature.id} className="feature-item">
                      <span className="feature-icon">{feature.icon}</span>
                      <span className="feature-name">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones (Por ejemplo, para reservar) */}
            <div className="product-actions">
              <button className="btn-reserve">Reservar Ahora</button>
              <Link to="/" className="btn-back">Volver a productos</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage; 