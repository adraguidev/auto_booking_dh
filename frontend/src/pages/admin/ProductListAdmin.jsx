import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductListAdmin.css';

const ProductListAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
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

  // Manejar selección/deselección de productos
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Manejar selección/deselección de todos los productos
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };
  
  const handleDelete = async (productId, productName) => {
    // Confirmar eliminación
    const isConfirmed = window.confirm(`¿Está seguro de eliminar el producto "${productName}"?`);
    
    if (!isConfirmed) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }

      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Actualizar estado para reflejar la eliminación
      setProducts(products.filter(product => product.id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto. Intente nuevamente.');
    }
  };

  // Manejar eliminación múltiple
  const handleDeleteMultiple = async () => {
    if (selectedProducts.length === 0) {
      alert('Por favor, seleccione al menos un producto para eliminar.');
      return;
    }

    const productNames = products
      .filter(product => selectedProducts.includes(product.id))
      .map(product => product.name)
      .join(', ');

    const isConfirmed = window.confirm(
      `¿Está seguro de eliminar los siguientes productos?\n${productNames}`
    );

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }

      // Eliminar cada producto seleccionado
      for (const productId of selectedProducts) {
        const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error al eliminar producto ${productId}: ${response.status}`);
        }
      }

      // Actualizar estado
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      alert('Productos eliminados correctamente');
    } catch (error) {
      console.error('Error al eliminar productos:', error);
      alert('Error al eliminar los productos. Intente nuevamente.');
    }
  };
  
  return (
    <div className="product-list-admin">
      <div className="product-list-header">
        <h1>Lista de Productos</h1>
        <div className="header-actions">
          {selectedProducts.length > 0 && (
            <button 
              className="delete-multiple-button"
              onClick={handleDeleteMultiple}
            >
              Eliminar Seleccionados ({selectedProducts.length})
            </button>
          )}
          <Link to="/admin/productos/nuevo" className="add-product-button">
            + Nuevo Producto
          </Link>
        </div>
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
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
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