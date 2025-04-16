import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import './SearchResults.css';

const ANIMATION_DURATION = 400; // ms

const SearchResults = ({ 
  results = [], 
  totalProducts = 0, 
  categoryName = null, 
  startDate = null, 
  endDate = null,
  loading = false,
  error = null
}) => {
  const [show, setShow] = useState(true);
  const [displayedResults, setDisplayedResults] = useState(results);
  const prevResultsRef = useRef(results);

  // Solo animar opacidad y desplazamiento, no height
  useEffect(() => {
    if (prevResultsRef.current !== results) {
      setShow(false); // fade-out
      const timeout = setTimeout(() => {
        setDisplayedResults(results);
        setShow(true); // fade-in
        prevResultsRef.current = results;
      }, ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [results]);

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

  // Generar título de búsqueda
  let searchTitle = '';
  if (categoryName) {
    searchTitle = `Productos en la categoría "${categoryName}"`;
  } else {
    searchTitle = 'Productos encontrados';
  }
  if (startDate && endDate) {
    searchTitle += ` del ${formatDate(startDate)} al ${formatDate(endDate)}`;
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>{searchTitle}</h2>
        <div className="search-results-count">
          {results.length === 0
            ? 'No se encontraron productos disponibles.'
            : `${results.length} producto${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      <div
        className={`search-results-grid${show ? ' show' : ' hide'}`}
      >
        {displayedResults.map(product => (
          <div className="search-result-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {results.length === 0 && (
        <div className="search-results-empty">
          <p>Prueba con otras fechas o categorías para encontrar productos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;