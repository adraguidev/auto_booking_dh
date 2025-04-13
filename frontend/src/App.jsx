import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProductFormAdmin from './pages/admin/ProductFormAdmin';
import AdminPanel from './pages/admin/AdminPanel';
import ProductListAdmin from './pages/admin/ProductListAdmin';
import CategoryListAdmin from './pages/admin/CategoryListAdmin';
import FeatureListAdmin from './pages/admin/FeatureListAdmin';
import ProductDetailPage from './pages/ProductDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
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
          
          <Route path="/login" element={
            <>
              <Header />
              <LoginPage />
            </>
          } />
          
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          
          {/* Rutas de administración (protegidas) */}
          <Route path="/administracion" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/productos" replace />} />
          </Route>
          
          <Route path="/admin/productos" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route index element={<ProductListAdmin />} />
            <Route path="nuevo" element={<ProductFormAdmin />} />
          </Route>
          
          <Route path="/admin/categorias" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route index element={<CategoryListAdmin />} />
          </Route>
          
          <Route path="/admin/caracteristicas" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route index element={<FeatureListAdmin />} />
          </Route>
          
          {/* Futuras rutas protegidas */}
          <Route path="/perfil" element={
            <ProtectedRoute>
              <>
                <Header />
                <div>Página de perfil (en construcción)</div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/favoritos" element={
            <ProtectedRoute>
              <>
                <Header />
                <div>Mis favoritos (en construcción)</div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/reservas" element={
            <ProtectedRoute>
              <>
                <Header />
                <div>Mis reservas (en construcción)</div>
              </>
            </ProtectedRoute>
          } />
          
          {/* Ruta de fallback para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
