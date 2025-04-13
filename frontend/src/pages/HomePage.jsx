import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import SearchResults from '../components/SearchResults';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    products: true,
    search: false
  });
  const [error, setError] = useState({
    categories: null,
    products: null,
    search: null
  });

  // Estado para los resultados de búsqueda
  const [searchResults, setSearchResults] = useState(null);
  const [searchParams, setSearchParams] = useState({
    startDate: null,
    endDate: null,
    categoryId: null,
    categoryName: null
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

  // Función para manejar la búsqueda
  const handleSearch = async (params) => {
    setLoading(prev => ({ ...prev, search: true }));
    setError(prev => ({ ...prev, search: null }));
    setSearchResults(null);
    
    try {
      // Construir URL con parámetros de búsqueda
      let url = 'http://localhost:8080/api/products/search?';
      const queryParams = [];
      
      if (params.startDate) queryParams.push(`startDate=${params.startDate}`);
      if (params.endDate) queryParams.push(`endDate=${params.endDate}`);
      if (params.categoryId) queryParams.push(`categoryId=${params.categoryId}`);
      
      url += queryParams.join('&');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la búsqueda');
      }
      
      const data = await response.json();
      
      // Guardar los resultados y parámetros de búsqueda para mostrarlos
      setSearchResults(data);
      
      // Encontrar el nombre de la categoría si se proporcionó un ID
      let categoryName = null;
      if (params.categoryId && categories.length > 0) {
        const selectedCategory = categories.find(cat => cat.id === Number(params.categoryId));
        categoryName = selectedCategory ? selectedCategory.name : null;
      }
      
      setSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        categoryId: params.categoryId,
        categoryName: data.categoryName || categoryName
      });
      
      // Hacer scroll a la sección de resultados de búsqueda
      setTimeout(() => {
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setError(prev => ({ ...prev, search: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  return (
    <main className="home-page">
      <section className="search-section">
        <h2>Buscar auto</h2>
        <SearchBox onSearch={handleSearch} categories={categories} />
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
                <Link 
                  to="#" 
                  className="category-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch({ categoryId: category.id });
                  }}
                >
                  {category.name}
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Mostrar resultados de búsqueda si existen */}
      {(searchResults || loading.search || error.search) && (
        <section id="search-results" className="search-results-section">
          <SearchResults 
            results={searchResults ? searchResults.results : []}
            totalProducts={searchResults ? searchResults.totalProducts : 0}
            categoryName={searchParams.categoryName}
            startDate={searchParams.startDate}
            endDate={searchParams.endDate}
            loading={loading.search}
            error={error.search}
          />
        </section>
      )}

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
              <div key={product.id} className="product-card-wrapper">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage; 