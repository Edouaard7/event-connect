import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import AlertMessage from '@/components/AlertMessage';

interface UserItem {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  role_id: number;
  is_active?: boolean;
}

const roleLabels: Record<number, string> = { 1: 'Admin', 2: 'Gerente', 3: 'Usuario' };

export default function UsersPage() {
  const { isAdmin, isAdminOrManager } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '', role_id: '3', is_active: true });

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers()
      .then((data: any) => { if (data.success) setUsers(data.users || []); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await api.createUser({ username: form.username, email: form.email, password: form.password, display_name: form.display_name, role_id: parseInt(form.role_id), is_active: form.is_active });
      setSuccess('Usuario creado'); setShowCreate(false);
      setForm({ username: '', email: '', password: '', display_name: '', role_id: '3', is_active: true });
      fetchUsers();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!editUser) return;
    const payload: Record<string, unknown> = { display_name: form.display_name, email: form.email };
    if (form.password) payload.password = form.password;
    if (isAdmin) { payload.role_id = parseInt(form.role_id); payload.is_active = form.is_active; }
    try {
      await api.updateUser(editUser.id, payload);
      setSuccess('Usuario actualizado'); setEditUser(null);
      fetchUsers();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setError('');
    try {
      await api.deleteUser(deleteId);
      setSuccess('Usuario eliminado'); setDeleteId(null);
      fetchUsers();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const openEdit = (u: UserItem) => {
    setForm({ username: u.username, email: u.email, password: '', display_name: u.display_name || '', role_id: String(u.role_id), is_active: u.is_active !== false });
    setEditUser(u);
  };

  const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  if (!isAdminOrManager) return <div className="container mt-4"><div className="alert alert-danger">Acceso denegado.</div></div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2><i className="bi bi-people me-2"></i>Usuarios</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <i className="bi bi-person-plus me-1"></i>Crear Usuario
          </button>
        )}
      </div>

      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      {showCreate && isAdmin && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white"><h5 className="mb-0">Nuevo Usuario</h5></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username *</label>
                  <input className="form-control" value={form.username} onChange={e => update('username', e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Contraseña *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => update('password', e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre para mostrar</label>
                  <input className="form-control" value={form.display_name} onChange={e => update('display_name', e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Rol</label>
                  <select className="form-select" value={form.role_id} onChange={e => update('role_id', e.target.value)}>
                    <option value="1">Admin</option><option value="2">Gerente</option><option value="3">Usuario</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3 d-flex align-items-end">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={form.is_active as boolean} onChange={e => update('is_active', e.target.checked)} id="isActive" />
                    <label className="form-check-label" htmlFor="isActive">Activo</label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-success">Crear</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowCreate(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : users.length === 0 ? (
        <div className="alert alert-info">No hay usuarios.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Nombre</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td>
                  <td>{u.display_name || '—'}</td>
                  <td><span className="badge bg-info">{roleLabels[u.role_id] || u.role_id}</span></td>
                  <td>{u.is_active !== false ? <span className="badge bg-success">Sí</span> : <span className="badge bg-danger">No</span>}</td>
                  <td>
                    {isAdminOrManager && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>}
                    {isAdmin && <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(u.id)}><i className="bi bi-trash"></i></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setEditUser(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Editar Usuario #{editUser.id}</h5><button type="button" className="btn-close" onClick={() => setEditUser(null)}></button></div>
              <div className="modal-body">
                <form onSubmit={handleEdit}>
                  <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label">Nombre</label><input className="form-control" value={form.display_name} onChange={e => update('display_name', e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label">Nueva contraseña (dejar vacío para no cambiar)</label><input type="password" className="form-control" value={form.password} onChange={e => update('password', e.target.value)} /></div>
                  {isAdmin && (
                    <>
                      <div className="mb-3"><label className="form-label">Rol</label>
                        <select className="form-select" value={form.role_id} onChange={e => update('role_id', e.target.value)}>
                          <option value="1">Admin</option><option value="2">Gerente</option><option value="3">Usuario</option>
                        </select>
                      </div>
                      <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" checked={form.is_active as boolean} onChange={e => update('is_active', e.target.checked)} />
                        <label className="form-check-label">Activo</label>
                      </div>
                    </>
                  )}
                  <button type="submit" className="btn btn-success">Actualizar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteId(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Confirmar eliminación</h5></div>
              <div className="modal-body"><p>¿Estás seguro de eliminar el usuario #{deleteId}?</p></div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
