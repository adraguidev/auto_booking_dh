import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductFormAdmin from './pages/admin/ProductFormAdmin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/productos/nuevo" element={<ProductFormAdmin />} />
          {/* Rutas adicionales se agregarán en futuros sprints */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
