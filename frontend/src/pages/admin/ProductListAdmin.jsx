import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProductListAdmin.css';
import { FaBoxOpen, FaPlus, FaTrashAlt } from 'react-icons/fa';

const ProductListAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { getAuthHeader } = useAuth();

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
      setError(
        'No se pudieron cargar los productos. Intente nuevamente más tarde.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección/deselección de productos
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
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
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const handleDelete = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const isConfirmed = window.confirm(
      `¿Está seguro de eliminar el producto "${product.name}"?`
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader()
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar productos');
        }
        throw new Error(`Error: ${response.status}`);
      }

      // Eliminar el producto de la lista local
      setProducts(products.filter((p) => p.id !== productId));
      // Si el producto estaba seleccionado, quitarlo de la selección
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedProducts.length === 0) {
      alert('Por favor, seleccione al menos un producto para eliminar.');
      return;
    }

    const productNames = products
      .filter((product) => selectedProducts.includes(product.id))
      .map((product) => product.name)
      .join(', ');

    const isConfirmed = window.confirm(
      `¿Está seguro de eliminar los siguientes productos?\n${productNames}`
    );

    if (!isConfirmed) return;

    let failed = [];
    let deleted = [];

    for (const productId of selectedProducts) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/products/${productId}`,
          {
            method: 'DELETE',
            headers: getAuthHeader()
          }
        );
        if (!response.ok) {
          try {
            const errorData = await response.json();
            failed.push({
              id: productId,
              error: errorData.error || `Error: ${response.status}`,
            });
          } catch (e) {
            failed.push({ id: productId, error: `Error: ${response.status}` });
          }
        } else {
          deleted.push(productId);
        }
      } catch (error) {
        failed.push({ id: productId, error: error.message });
      }
    }

    if (deleted.length > 0) {
      setProducts(products.filter((product) => !deleted.includes(product.id)));
      setSelectedProducts((prev) => prev.filter((id) => !deleted.includes(id)));
    }

    if (failed.length === 0) {
      alert('Productos eliminados correctamente');
    } else {
      alert(
        `Se eliminaron ${deleted.length} productos, pero ${failed.length} no pudieron ser eliminados.\nDetalles: ${failed
          .map((f) => `ID ${f.id}: ${f.error}`)
          .join('\n')}`
      );
    }
  };

  return (
    <div className="product-list-admin">
      <div className="product-list-header modern-header">
        <div className="header-title-group">
          <FaBoxOpen className="header-icon" />
          <h1 className="modern-title">Lista de Productos</h1>
        </div>
        <div className="header-actions">
          {selectedProducts.length > 0 && (
            <button
              className="delete-multiple-button modern-action-btn"
              onClick={handleDeleteMultiple}
            >
              <FaTrashAlt style={{ marginRight: 6 }} /> Eliminar Seleccionados (
              {selectedProducts.length})
            </button>
          )}
          <Link
            to="/admin/productos/nuevo"
            className="add-product-button modern-action-btn"
          >
            <FaPlus style={{ marginRight: 6 }} /> Nuevo Producto
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
            {products.map((product) => (
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
                    onClick={() => handleDelete(product.id)}
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
