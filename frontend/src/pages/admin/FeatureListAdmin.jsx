import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FeatureListAdmin.css';

const API_URL = 'http://localhost:8080/api';

const FeatureListAdmin = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: '', icon: '' });
  const [editingFeature, setEditingFeature] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState(null);
  
  const navigate = useNavigate();
  
  // Fetch the list of features when component mounts
  useEffect(() => {
    fetchFeatures();
  }, []);
  
  // Function to fetch all features from the API
  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }
      
      const response = await axios.get(`${API_URL}/features`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setFeatures(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al cargar las características');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle input changes for new feature
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeature(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to handle input changes for editing feature
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingFeature(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to create a new feature
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newFeature.name.trim()) {
      setError('El nombre de la característica es obligatorio');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }
      
      await axios.post(`${API_URL}/features`, newFeature, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNewFeature({ name: '', icon: '' });
      fetchFeatures();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.message || 'Datos de característica inválidos');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al crear la característica');
      }
    }
  };
  
  // Function to prepare for editing
  const startEditing = (feature) => {
    setEditingFeature({ ...feature });
  };
  
  // Function to cancel editing
  const cancelEditing = () => {
    setEditingFeature(null);
  };
  
  // Function to save edited feature
  const saveEditing = async () => {
    if (!editingFeature.name.trim()) {
      setError('El nombre de la característica es obligatorio');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }
      
      await axios.put(`${API_URL}/features/${editingFeature.id}`, editingFeature, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setEditingFeature(null);
      fetchFeatures();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.message || 'Datos de característica inválidos');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al actualizar la característica');
      }
    }
  };
  
  // Functions for delete confirmation modal
  const openDeleteModal = (feature) => {
    setFeatureToDelete(feature);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFeatureToDelete(null);
  };
  
  // Function to delete a feature
  const handleDelete = async () => {
    if (!featureToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autorizado. Por favor, inicia sesión.');
      }
      
      await axios.delete(`${API_URL}/features/${featureToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      closeDeleteModal();
      fetchFeatures();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response && err.response.status === 409) {
        setError('Esta característica está asociada a uno o más productos y no puede ser eliminada');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al eliminar la característica');
      }
      closeDeleteModal();
    }
  };
  
  return (
    <div className="feature-list-admin">
      <h2 className="admin-title">Administración de Características</h2>
      
      {error && <div className="admin-error">{error}</div>}
      
      <div className="admin-section">
        <h3>Agregar nueva característica</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="admin-input"
                value={newFeature.name} 
                onChange={handleInputChange} 
                placeholder="Nombre de la característica"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="icon">Ícono (clase CSS o emoji):</label>
              <input 
                type="text" 
                id="icon" 
                name="icon" 
                className="admin-input"
                value={newFeature.icon} 
                onChange={handleInputChange} 
                placeholder="Ejemplo: 📱 o fa-wifi"
              />
            </div>
          </div>
          <button type="submit" className="admin-button create-button">
            Crear Característica
          </button>
        </form>
      </div>
      
      <div className="admin-section">
        <h3>Lista de Características</h3>
        
        {loading ? (
          <div className="admin-loading">Cargando características...</div>
        ) : features.length === 0 ? (
          <div className="admin-empty">No hay características disponibles</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ícono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {features.map(feature => (
                editingFeature && editingFeature.id === feature.id ? (
                  <tr key={feature.id}>
                    <td>{feature.id}</td>
                    <td>
                      <input 
                        type="text" 
                        name="name" 
                        className="admin-input"
                        value={editingFeature.name} 
                        onChange={handleEditInputChange} 
                        required
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        name="icon" 
                        className="admin-input"
                        value={editingFeature.icon || ''} 
                        onChange={handleEditInputChange} 
                      />
                    </td>
                    <td className="action-buttons">
                      <button className="admin-button edit-button" onClick={saveEditing}>
                        Guardar
                      </button>
                      <button className="admin-button cancel-button" onClick={cancelEditing}>
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={feature.id}>
                    <td>{feature.id}</td>
                    <td>{feature.name}</td>
                    <td className="icon-preview">{feature.icon}</td>
                    <td className="action-buttons">
                      <button className="admin-button edit-button" onClick={() => startEditing(feature)}>
                        Editar
                      </button>
                      <button className="admin-button delete-button" onClick={() => openDeleteModal(feature)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {showDeleteModal && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar la característica "{featureToDelete?.name}"?</p>
            <div className="confirmation-warning">
              <p><strong>Advertencia:</strong> Esta acción no se puede deshacer.</p>
              <p>Si la característica está asociada a productos, no podrá ser eliminada.</p>
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

export default FeatureListAdmin; 