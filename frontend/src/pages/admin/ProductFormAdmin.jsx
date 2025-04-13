import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductFormAdmin.css';
import { api } from '../../services/api';

const ProductFormAdmin = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  
  const navigate = useNavigate();

  // Cargar categorías y características al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('http://localhost:8080/api/categories');
        
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    const fetchFeatures = async () => {
      try {
        setLoadingFeatures(true);
        const response = await api.get('/features');
        setFeatures(response.data);
      } catch (error) {
        console.error('Error al cargar características:', error);
      } finally {
        setLoadingFeatures(false);
      }
    };
    
    fetchCategories();
    fetchFeatures();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (images.length === 0) {
      newErrors.images = 'Debe incluir al menos una imagen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Convertir archivos a Base64
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    });
    
    // Crear previsualizaciones
    const previewPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    // Actualizar estado cuando todas las promesas se resuelvan
    Promise.all(filePromises)
      .then(base64Files => {
        setImages(prevImages => [...prevImages, ...base64Files]);
      });
      
    Promise.all(previewPromises)
      .then(previews => {
        setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
      });
  };
  
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Manejar la selección de características
  const handleFeatureChange = (featureId) => {
    setSelectedFeatures(prevSelectedFeatures => {
      if (prevSelectedFeatures.includes(featureId)) {
        return prevSelectedFeatures.filter(id => id !== featureId);
      } else {
        return [...prevSelectedFeatures, featureId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        name,
        description,
        images,
        categoryId: categoryId || null, // Incluir categoryId si está seleccionado
        featureIds: selectedFeatures.length > 0 ? selectedFeatures : null // Incluir featureIds si hay seleccionados
      };
      
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      
      if (response.status === 201) {
        // Obtener el nombre de la categoría para el mensaje de éxito
        let successMsg = 'Producto creado exitosamente';
        if (categoryId) {
          const selectedCategory = categories.find(c => c.id.toString() === categoryId.toString());
          if (selectedCategory) {
            successMsg += ` en categoría "${selectedCategory.name}"`;
          }
        }
        
        setSuccessMessage(successMsg);
        
        // Limpiar formulario
        setName('');
        setDescription('');
        setCategoryId('');
        setSelectedFeatures([]);
        setImages([]);
        setImagePreviews([]);
        setErrors({});
        
        // Redireccionar después de un breve momento
        setTimeout(() => {
          navigate('/admin/productos');
        }, 2000);
      } else {
        // Mostrar error del servidor
        setErrors({ 
          server: data.error || 'Error al crear el producto. Inténtalo nuevamente.'
        });
      }
    } catch (error) {
      setErrors({ 
        server: 'Error de conexión. Verifica tu conexión a internet e inténtalo nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-form-container">
      <h1>Agregar Nuevo Producto</h1>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.server && (
        <div className="error-message server-error">
          {errors.server}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Producto</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese el nombre del producto"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingrese una descripción detallada del producto"
            rows="5"
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loadingCategories}
          >
            <option value="">Sin categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {loadingCategories && <div className="loading-text">Cargando categorías...</div>}
        </div>
        
        <div className="form-group">
          <label>Características</label>
          {loadingFeatures ? (
            <div className="loading-text">Cargando características...</div>
          ) : features.length === 0 ? (
            <div className="info-text">No hay características disponibles</div>
          ) : (
            <div className="features-checkbox-container">
              {features.map(feature => (
                <div key={feature.id} className="feature-checkbox">
                  <input
                    type="checkbox"
                    id={`feature-${feature.id}`}
                    value={feature.id}
                    checked={selectedFeatures.includes(feature.id)}
                    onChange={() => handleFeatureChange(feature.id)}
                  />
                  <label htmlFor={`feature-${feature.id}`}>
                    {feature.icon} {feature.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="images">Imágenes</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="file-input"
          />
          {errors.images && <div className="error-message">{errors.images}</div>}
          
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-container">
                  <img src={preview.url} alt={`Preview ${index + 1}`} className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormAdmin; 