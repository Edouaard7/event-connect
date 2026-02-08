import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import AlertMessage from '@/components/AlertMessage';

interface Equipment {
  id: number;
  name: string;
  sku?: string;
  status: string;
  notes?: string;
}

const statusBadge: Record<string, string> = {
  available: 'bg-success',
  in_use: 'bg-primary',
  maintenance: 'bg-warning text-dark',
  retired: 'bg-secondary',
};

export default function EquipmentPage() {
  const { isAdmin, isAdminOrManager } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', status: 'available', notes: '' });

  const fetch = () => {
    setLoading(true);
    api.getEquipment()
      .then((data: any) => { if (data.success) setEquipment(data.equipment || []); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await api.createEquipment({ name: form.name, sku: form.sku, status: form.status, notes: form.notes });
      setSuccess('Equipo creado'); setShowCreate(false);
      setForm({ name: '', sku: '', status: 'available', notes: '' });
      fetch();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!editItem) return;
    try {
      await api.updateEquipment(editItem.id, { name: form.name, sku: form.sku, status: form.status, notes: form.notes });
      setSuccess('Equipo actualizado'); setEditItem(null);
      fetch();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setError('');
    try {
      await api.deleteEquipment(deleteId);
      setSuccess('Equipo eliminado'); setDeleteId(null);
      fetch();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const openEdit = (item: Equipment) => {
    setForm({ name: item.name, sku: item.sku || '', status: item.status, notes: item.notes || '' });
    setEditItem(item);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const EquipmentForm = ({ onSubmit, submitLabel }: { onSubmit: (e: FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre *</label>
        <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="form-label">SKU</label>
        <input className="form-control" value={form.sku} onChange={e => update('sku', e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Estado</label>
        <select className="form-select" value={form.status} onChange={e => update('status', e.target.value)}>
          <option value="available">Disponible</option>
          <option value="in_use">En uso</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="retired">Retirado</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Notas</label>
        <textarea className="form-control" rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} />
      </div>
      <button type="submit" className="btn btn-success">{submitLabel}</button>
    </form>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2><i className="bi bi-tools me-2"></i>Equipos</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowCreate(!showCreate); setEditItem(null); }}>
            <i className="bi bi-plus-circle me-1"></i>Crear Equipo
          </button>
        )}
      </div>

      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      {showCreate && isAdmin && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white"><h5 className="mb-0">Nuevo Equipo</h5></div>
          <div className="card-body"><EquipmentForm onSubmit={handleCreate} submitLabel="Crear" /></div>
        </div>
      )}

      {loading ? <Spinner /> : equipment.length === 0 ? (
        <div className="alert alert-info">No hay equipos registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr><th>ID</th><th>Nombre</th><th>SKU</th><th>Estado</th><th>Notas</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {equipment.map(eq => (
                <tr key={eq.id}>
                  <td>{eq.id}</td>
                  <td>{eq.name}</td>
                  <td>{eq.sku || '—'}</td>
                  <td><span className={`badge ${statusBadge[eq.status] || 'bg-secondary'}`}>{eq.status}</span></td>
                  <td>{eq.notes || '—'}</td>
                  <td>
                    {isAdminOrManager && (
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(eq)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                    {isAdmin && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(eq.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setEditItem(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Equipo #{editItem.id}</h5>
                <button type="button" className="btn-close" onClick={() => setEditItem(null)}></button>
              </div>
              <div className="modal-body"><EquipmentForm onSubmit={handleEdit} submitLabel="Actualizar" /></div>
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
              <div className="modal-body"><p>¿Estás seguro de eliminar el equipo #{deleteId}?</p></div>
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
