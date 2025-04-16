import { useState, useEffect } from 'react';
import './SearchBox.css';

const SearchBox = ({ onSearch, categories = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState({});

  // Validar formulario cuando cambian los valores
  useEffect(() => {
    // Validar fechas
    let newErrors = {};

    if (!startDate && !endDate) {
      newErrors.dates = 'Selecciona las fechas para tu búsqueda';
    } else if (!startDate) {
      newErrors.startDate = 'Selecciona una fecha de inicio';
    } else if (!endDate) {
      newErrors.endDate = 'Selecciona una fecha de fin';
    } else if (new Date(startDate) > new Date(endDate)) {
      newErrors.dateRange =
        'La fecha de inicio debe ser anterior a la fecha de fin';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0 && startDate && endDate);
  }, [startDate, endDate, categoryId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Si el formulario no es válido, no permitir la búsqueda
    if (!isValid) return;

    onSearch({
      startDate,
      endDate,
      categoryId: categoryId || null,
    });
  };

  // Obtener la fecha mínima (hoy) para el selector
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="search-box">
      <h2 className="search-box-title" style={{ marginBottom: '36px' }}>
        Encuentra tu coche ideal
      </h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-fields">
          <div className="date-range-group">
            <div className="form-group">
              <label htmlFor="startDate">Fecha de inicio</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className={errors.startDate || errors.dateRange ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Fecha de fin</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className={errors.endDate || errors.dateRange ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errors.dateRange && (
          <div className="error-message">{errors.dateRange}</div>
        )}

        <button type="submit" className="search-button" disabled={!isValid}>
          Buscar
        </button>
      </form>
    </div>
  );
};

export default SearchBox;