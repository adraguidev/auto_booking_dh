import ProductCard from './ProductCard';
import './SearchResults.css';

const SearchResults = ({ 
  results = [], 
  totalProducts = 0, 
  categoryName = null, 
  startDate = null, 
  endDate = null,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="search-results">
        <div className="search-results-loading">
          <p>Buscando productos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results">
        <div className="search-results-error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear fechas para el título de búsqueda
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Generar título de búsqueda
  let searchTitle = 'Resultados de tu búsqueda';
  if (startDate && endDate) {
    searchTitle += ` del ${formattedStartDate} al ${formattedEndDate}`;
  }
  if (categoryName) {
    searchTitle += ` en ${categoryName}`;
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>{searchTitle}</h2>
        
        <div className="search-results-count">
          {results.length === 0 ? (
            <p>No se encontraron productos para los criterios seleccionados</p>
          ) : (
            <p>
              {results.length === 1 
                ? '1 resultado encontrado' 
                : `${results.length} resultados encontrados`}
              {totalProducts > 0 && ` de ${totalProducts} productos disponibles`}
            </p>
          )}
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="search-results-grid">
          {results.map(product => (
            <div key={product.id} className="search-result-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      
      {results.length === 0 && (
        <div className="search-results-empty">
          <p>Prueba con otras fechas o categorías para encontrar productos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 