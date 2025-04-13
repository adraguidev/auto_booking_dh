import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  if (!product) return null;
  
  const { id, name, description, images, category, features } = product;
  
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

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={imageUrl} alt={name} />
      </div>
      
      <div className="product-content">
        <h3 className="product-title">{name}</h3>
        
        <p className="product-description">{truncatedDescription}</p>
        
        {category && (
          <span className="product-category">{category.name}</span>
        )}
        
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