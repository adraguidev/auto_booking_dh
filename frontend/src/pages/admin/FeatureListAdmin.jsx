import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../../src/assets/styles/admin/AdminPages.css';

const FeatureListAdmin = () => {
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({ name: '', icon: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar características al montar el componente
  useEffect(() => {
    fetchFeatures();
  }, []);

  // Obtener todas las características de la API
  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const response = await api.get('/features');
      setFeatures(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener características:', err);
      setError('Error al cargar las características. Por favor, intente nuevamente.');
      toast.error('Error al cargar las características');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeature({ ...newFeature, [name]: value });
  };

  // Crear una nueva característica
  const handleCreateFeature = async (e) => {
    e.preventDefault();
    if (!newFeature.name.trim()) {
      toast.warning('El nombre de la característica es obligatorio');
      return;
    }

    try {
      const response = await api.post('/features', newFeature);
      setFeatures([...features, response.data]);
      setNewFeature({ name: '', icon: '' });
      toast.success('Característica creada exitosamente');
    } catch (err) {
      console.error('Error al crear característica:', err);
      toast.error(err.response?.data?.error || 'Error al crear la característica');
    }
  };

  // Eliminar una característica
  const handleDeleteFeature = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta característica? Esto la quitará de cualquier producto asociado.')) {
      return;
    }

    try {
      await api.delete(`/features/${id}`);
      setFeatures(features.filter(feature => feature.id !== id));
      toast.success('Característica eliminada exitosamente');
    } catch (err) {
      console.error('Error al eliminar característica:', err);
      toast.error(err.response?.data?.error || 'Error al eliminar la característica');
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Gestión de Características</h1>

        {/* Formulario para crear una nueva característica */}
        <div className="admin-form-container">
          <h2>Nueva Característica</h2>
          <form onSubmit={handleCreateFeature} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newFeature.name}
                onChange={handleInputChange}
                placeholder="Ej: Aire Acondicionado"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Ícono (emoji o texto):</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={newFeature.icon}
                onChange={handleInputChange}
                placeholder="Ej: ❄️ o fa-snowflake"
              />
            </div>

            <button type="submit" className="btn btn-primary">Crear Característica</button>
          </form>
        </div>

        {/* Lista de características existentes */}
        <div className="admin-list-container">
          <h2>Características Existentes</h2>
          {loading ? (
            <p>Cargando características...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : features.length === 0 ? (
            <p>No hay características registradas.</p>
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
                {features.map((feature) => (
                  <tr key={feature.id}>
                    <td>{feature.id}</td>
                    <td>{feature.name}</td>
                    <td>{feature.icon}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="btn btn-danger"
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
    </div>
  );
};

export default FeatureListAdmin; 