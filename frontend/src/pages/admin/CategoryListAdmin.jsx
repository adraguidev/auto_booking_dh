import { useState, useEffect } from 'react';
import './CategoryListAdmin.css';

const CategoryListAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []);

  // Obtener lista de categorías
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/categories');
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las categorías. Por favor, intente nuevamente.');
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear una nueva categoría
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    // Validar nombre
    if (!newCategoryName.trim()) {
      setFeedback({
        message: 'El nombre de la categoría no puede estar vacío',
        type: 'error'
      });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear categoría');
      }
      
      const newCategory = await response.json();
      
      // Actualizar la lista de categorías
      setCategories([...categories, newCategory]);
      
      // Limpiar el campo y mostrar feedback
      setNewCategoryName('');
      setFeedback({
        message: `Categoría "${newCategory.name}" creada exitosamente`,
        type: 'success'
      });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 3000);
      
    } catch (err) {
      setFeedback({
        message: err.message || 'Error al crear la categoría',
        type: 'error'
      });
      console.error('Error al crear categoría:', err);
    }
  };

  // Eliminar una categoría
  const handleDeleteCategory = async (categoryId, categoryName) => {
    // Confirmación del usuario
    const confirmed = window.confirm(
      `¿Eliminar categoría "${categoryName}"? Esto quitará esta categoría de cualquier producto asociado.`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar categoría');
      }
      
      // Actualizar la lista de categorías
      setCategories(categories.filter(cat => cat.id !== categoryId));
      
      // Mostrar feedback
      setFeedback({
        message: `Categoría "${categoryName}" eliminada exitosamente`,
        type: 'success'
      });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 3000);
      
    } catch (err) {
      setFeedback({
        message: err.message || 'Error al eliminar la categoría',
        type: 'error'
      });
      console.error('Error al eliminar categoría:', err);
    }
  };

  return (
    <div className="category-list-admin">
      <h2>Administrar Categorías</h2>
      
      {/* Formulario para crear nueva categoría */}
      <div className="category-form">
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
            />
            <button type="submit" className="btn-create">Crear categoría</button>
          </div>
        </form>
      </div>
      
      {/* Mensajes de feedback */}
      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Lista de categorías */}
      <div className="categories-container">
        {loading ? (
          <p className="loading">Cargando categorías...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : categories.length === 0 ? (
          <p className="empty-message">No hay categorías registradas</p>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
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
    </div>
  );
};

export default CategoryListAdmin; 