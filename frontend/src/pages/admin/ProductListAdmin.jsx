import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductListAdmin.css';

const ProductListAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/products');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('No se pudieron cargar los productos. Intente nuevamente más tarde.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (productId, productName) => {
    // Confirmar eliminación
    const isConfirmed = window.confirm(`¿Está seguro de eliminar el producto "${productName}"?`);
    
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Actualizar estado para reflejar la eliminación
      setProducts(products.filter(product => product.id !== productId));
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto. Intente nuevamente.');
    }
  };
  
  return (
    <div className="product-list-admin">
      <div className="product-list-header">
        <h1>Lista de Productos</h1>
        <Link to="/admin/productos/nuevo" className="add-product-button">
          + Nuevo Producto
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-message">Cargando productos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-message">No hay productos registrados</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductListAdmin; 