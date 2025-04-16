import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, getAuthHeader } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Si tenemos la información del usuario en el contexto de autenticación, la usamos
    if (currentUser) {
      setUserProfile(currentUser);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>No has iniciado sesión</h2>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <h2>Cargando perfil...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Error al cargar el perfil</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {currentUser.firstName && currentUser.lastName ? (
            <div className="avatar-circle">
              {currentUser.firstName.charAt(0).toUpperCase()}
              {currentUser.lastName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="avatar-circle">U</div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Nombre:</label>
            <p>
              {currentUser.firstName} {currentUser.lastName}
            </p>
          </div>

          <div className="info-group">
            <label>Email:</label>
            <p>{currentUser.email}</p>
          </div>

          <div className="info-group">
            <label>Tipo de cuenta:</label>
            <p>{currentUser.isAdmin ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <a href="/reservas" className="profile-button">
          Mis Reservas
        </a>
        <a href="/favoritos" className="profile-button">
          Mis Favoritos
        </a>
      </div>
    </div>
  );
};

export default ProfilePage;
