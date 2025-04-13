import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    products: true
  });
  const [error, setError] = useState({
    categories: null,
    products: null
  });

  // Cargar categorías y productos al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/categories');
        
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const data = await response.json();
        setCategories(data);
        setError(prev => ({ ...prev, categories: null }));
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError(prev => ({ ...prev, categories: 'Error al cargar categorías' }));
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        setProducts(data);
        setError(prev => ({ ...prev, products: null }));
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(prev => ({ ...prev, products: 'Error al cargar productos' }));
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    
    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <main className="home-page">
      <section className="search-section">
        <h2>Buscar auto</h2>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscá por fecha..." 
            disabled 
          />
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Categorías</h2>
        <div className="categories-container">
          {loading.categories ? (
            <p className="loading-text">Cargando categorías...</p>
          ) : error.categories ? (
            <p className="error-text">{error.categories}</p>
          ) : categories.length === 0 ? (
            <p className="empty-text">No hay categorías disponibles</p>
          ) : (
            categories.map(category => (
              <div key={category.id} className="category-card">
                <Link to={`/buscar?categoria=${category.id}`} className="category-link">
                  {category.name}
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="recommendations-section">
        <h2 className="section-title">Recomendaciones</h2>
        <div className="recommendations-container">
          {loading.products ? (
            <p className="loading-text">Cargando productos...</p>
          ) : error.products ? (
            <p className="error-text">{error.products}</p>
          ) : products.length === 0 ? (
            <p className="empty-text">No hay productos disponibles</p>
          ) : (
            products.slice(0, 4).map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.images && product.images.length > 0 && (
                    <img src={product.images[0]} alt={product.name} />
                  )}
                </div>
                <h3>{product.name}</h3>
                <p>{product.description.substring(0, 60)}...</p>
                {product.category && (
                  <span className="product-category">{product.category.name}</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage; 