import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdminOrManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // ignore
    }
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const closeNav = () => setCollapsed(true);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeNav}>
          <i className="bi bi-building me-2"></i>Sistema de Gestión
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/" onClick={closeNav}>
                <i className="bi bi-house me-1"></i>Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/eventos')}`} to="/eventos" onClick={closeNav}>
                <i className="bi bi-calendar-event me-1"></i>Eventos
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/equipos')}`} to="/equipos" onClick={closeNav}>
                <i className="bi bi-tools me-1"></i>Equipos
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/reservas')}`} to="/reservas" onClick={closeNav}>
                <i className="bi bi-bookmark me-1"></i>Reservas
              </Link>
            </li>
            {isAdminOrManager && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/reportes')}`} to="/reportes" onClick={closeNav}>
                    <i className="bi bi-file-earmark-bar-graph me-1"></i>Reportes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/usuarios')}`} to="/usuarios" onClick={closeNav}>
                    <i className="bi bi-people me-1"></i>Usuarios
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/perfil')}`} to="/perfil" onClick={closeNav}>
                    <i className="bi bi-person-circle me-1"></i>{user.display_name || user.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={() => { closeNav(); handleLogout(); }}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login" onClick={closeNav}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/registro')}`} to="/registro" onClick={closeNav}>
                    Registro
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
