import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProductFormAdmin.css';

const ProductFormAdmin = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [price, setPrice] = useState('');
  
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();

  // Cargar categorías al montar el componente
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
    
    fetchCategories();
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
        price: parseFloat(price)
      };
      
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          setErrors({ 
            server: 'No tienes permisos para crear productos. Verifica que tu sesión es de administrador.'
          });
          return;
        }
      }
      
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
        setImages([]);
        setImagePreviews([]);
        setErrors({});
        setPrice('');
        
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
      console.error('Error al crear producto:', error);
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
          <label htmlFor="price">Precio por día (€):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
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
            className="cancel-button"
            onClick={() => navigate('/admin/productos')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormAdmin; 