import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ProductFormAdmin from './pages/admin/ProductFormAdmin';
import AdminPanel from './pages/admin/AdminPanel';
import ProductListAdmin from './pages/admin/ProductListAdmin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={
          <>
            <Header />
            <HomePage />
          </>
        } />
        
        <Route path="/registro" element={
          <>
            <Header />
            <RegisterPage />
          </>
        } />
        
        {/* Rutas de administración */}
        <Route path="/administracion" element={<AdminPanel />}>
          <Route index element={<Navigate to="/admin/productos" replace />} />
        </Route>
        
        <Route path="/admin/productos" element={<AdminPanel />}>
          <Route index element={<ProductListAdmin />} />
          <Route path="nuevo" element={<ProductFormAdmin />} />
        </Route>
        
        {/* Rutas adicionales se agregarán en futuros sprints */}
      </Routes>
    </Router>
  );
}

export default App;
