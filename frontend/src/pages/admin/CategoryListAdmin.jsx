import React, { useState, useEffect } from 'react';
import './CategoryListAdmin.css';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const CategoryListAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las categorías. Por favor, intente de nuevo.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No autorizado. Por favor, inicie sesión.');
        return;
      }

      // Configurar los headers con el token de autenticación
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post(
        `${API_URL}/categories`,
        { name: newCategory },
        config
      );

      setCategories([...categories, response.data]);
      setNewCategory('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('No autorizado. Por favor, inicie sesión.');
      } else {
        setError('Error al crear la categoría. Por favor, intente de nuevo.');
      }
      console.error('Error creating category:', err);
    }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No autorizado. Por favor, inicie sesión.');
        closeDeleteModal();
        return;
      }

      // Configurar los headers con el token de autenticación
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(
        `${API_URL}/categories/${categoryToDelete.id}`,
        config
      );

      // Actualizar la lista de categorías
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      setError(null);
      closeDeleteModal();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('No autorizado. Por favor, inicie sesión.');
      } else if (err.response && err.response.status === 409) {
        setError('No se puede eliminar la categoría porque está asociada a productos.');
      } else {
        setError('Error al eliminar la categoría. Por favor, intente de nuevo.');
      }
      console.error('Error deleting category:', err);
      closeDeleteModal();
    }
  };

  return (
    <div className="category-list-admin">
      <h2 className="admin-title">Administración de Categorías</h2>

      <div className="admin-section">
        <h3>Crear Nueva Categoría</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <input
              type="text"
              className="admin-input"
              placeholder="Nombre de la categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="admin-button create-button" 
              disabled={!newCategory.trim()}
            >
              Crear Categoría
            </button>
          </div>
        </form>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-section">
        <h3>Categorías Existentes</h3>
        {loading ? (
          <div className="admin-loading">Cargando categorías...</div>
        ) : categories.length > 0 ? (
          <table className="admin-table">
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
                      className="admin-button delete-button"
                      onClick={() => openDeleteModal(category)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">No hay categorías disponibles.</div>
        )}
      </div>

      {deleteModalOpen && categoryToDelete && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Está seguro de que desea eliminar la categoría <strong>{categoryToDelete.name}</strong>?</p>
            <div className="confirmation-warning">
              Esta acción no se puede deshacer. Si hay productos asociados a esta categoría, la eliminación podría fallar.
            </div>
            <div className="confirmation-buttons">
              <button className="admin-button cancel-button" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="admin-button confirm-button" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListAdmin; 