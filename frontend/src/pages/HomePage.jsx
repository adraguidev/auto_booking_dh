import './HomePage.css';

const HomePage = () => {
  return (
    <main className="home-page">
      <section className="search-section">
        <h2>Buscar auto</h2>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscá por fecha..." 
            disabled 
          />
        </div>
      </section>

      <section className="categories-section">
        <h2 className="section-title">Categorías</h2>
        <div className="categories-container">
          <div className="category-card">Sedán</div>
          <div className="category-card">SUV</div>
          <div className="category-card">Compacto</div>
          <div className="category-card">Camioneta</div>
          <div className="category-card">Deportivo</div>
          <div className="category-card">Lujo</div>
        </div>
      </section>

      <section className="recommendations-section">
        <h2 className="section-title">Recomendaciones</h2>
        <div className="recommendations-container">
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Toyota Corolla</h3>
            <p>Sedán confortable para toda la familia</p>
          </div>
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Honda CR-V</h3>
            <p>SUV espacioso y económico</p>
          </div>
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Ford Mustang</h3>
            <p>Deportivo con gran potencia</p>
          </div>
          <div className="product-card">
            <div className="product-image"></div>
            <h3>BMW Serie 3</h3>
            <p>Lujo y rendimiento en un solo auto</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage; 