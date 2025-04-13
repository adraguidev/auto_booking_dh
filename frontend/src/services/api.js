/**
 * Servicio para manejar peticiones HTTP con autenticación JWT
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Obtiene el token JWT del localStorage
 * @returns {string|null} El token JWT o null si no existe
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Realiza una petición HTTP con autenticación JWT si está disponible
 * @param {string} url - La URL a la que hacer la petición
 * @param {object} options - Opciones para fetch (method, headers, body, etc.)
 * @returns {Promise} La respuesta de la petición
 */
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Si el token es inválido (401), intentar limpiar el localStorage
    if (response.status === 401) {
      console.warn('Token inválido o expirado');
      // Opcional: limpiar token si está expirado (descomentarlo si se quiere implementar logout automático)
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('user');
    }
    
    return response;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

/**
 * Métodos para realizar peticiones HTTP comunes
 */
const api = {
  /**
   * Realiza una petición GET
   * @param {string} url - La URL a la que hacer la petición
   * @param {boolean} auth - Si se debe incluir el token de autenticación
   * @returns {Promise} La respuesta de la petición
   */
  get: async (url, auth = true) => {
    const response = auth 
      ? await fetchWithAuth(url, { method: 'GET' })
      : await fetch(`${API_BASE_URL}${url}`);
      
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Realiza una petición POST
   * @param {string} url - La URL a la que hacer la petición
   * @param {object} data - Los datos a enviar en el cuerpo de la petición
   * @param {boolean} auth - Si se debe incluir el token de autenticación
   * @returns {Promise} La respuesta de la petición
   */
  post: async (url, data, auth = true) => {
    const config = {
      method: 'POST',
      body: JSON.stringify(data)
    };
    
    const response = auth
      ? await fetchWithAuth(url, config)
      : await fetch(`${API_BASE_URL}${url}`, {
          ...config,
          headers: { 'Content-Type': 'application/json' }
        });
    
    return response;
  },
  
  /**
   * Realiza una petición PUT
   * @param {string} url - La URL a la que hacer la petición
   * @param {object} data - Los datos a enviar en el cuerpo de la petición
   * @returns {Promise} La respuesta de la petición
   */
  put: async (url, data) => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Realiza una petición DELETE
   * @param {string} url - La URL a la que hacer la petición
   * @returns {Promise} La respuesta de la petición
   */
  delete: async (url) => {
    const response = await fetchWithAuth(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return response.json();
  }
};

export default api; 