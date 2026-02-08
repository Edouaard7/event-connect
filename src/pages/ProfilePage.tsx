import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <div className="container mt-4"><div className="alert alert-warning">No has iniciado sesión.</div></div>;

  const roleLabel = user.role_id === 1 ? 'Administrador' : user.role_id === 2 ? 'Gerente' : 'Usuario';

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0"><i className="bi bi-person-circle me-2"></i>Mi Perfil</h4>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr><th>ID</th><td>{user.id}</td></tr>
                  <tr><th>Username</th><td>{user.username}</td></tr>
                  <tr><th>Email</th><td>{user.email}</td></tr>
                  <tr><th>Nombre</th><td>{user.display_name || '—'}</td></tr>
                  <tr><th>Rol</th><td><span className="badge bg-info">{roleLabel}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
