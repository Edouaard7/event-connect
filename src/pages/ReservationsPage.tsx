import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import AlertMessage from '@/components/AlertMessage';

interface Reservation {
  id: number;
  user_id: number;
  equipment_id?: number;
  start_time: string;
  end_time: string;
  status: string;
  equipment_name?: string;
  username?: string;
}

interface Equipment {
  id: number;
  name: string;
  status: string;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-primary',
  active: 'bg-success',
  completed: 'bg-secondary',
  cancelled: 'bg-danger',
};

export default function ReservationsPage() {
  const { user, isAdminOrManager } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [extendId, setExtendId] = useState<number | null>(null);
  const [newEndTime, setNewEndTime] = useState('');
  const [form, setForm] = useState({ start_time: '', end_time: '', equipment_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, eqData]: any[] = await Promise.all([
        api.getReservations(isAdminOrManager),
        api.getEquipment().catch(() => ({ success: true, equipment: [] }))
      ]);
      if (resData.success) setReservations(resData.reservations || []);
      if (eqData.success) setEquipment(eqData.equipment || []);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const payload: Record<string, unknown> = { start_time: form.start_time, end_time: form.end_time };
      if (form.equipment_id) payload.equipment_id = parseInt(form.equipment_id);
      await api.createReservation(payload);
      setSuccess('Reserva creada'); setShowCreate(false);
      setForm({ start_time: '', end_time: '', equipment_id: '' });
      fetchData();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleConfirm = async (id: number) => {
    try { await api.confirmReservation(id); setSuccess('Reserva confirmada'); fetchData(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleComplete = async (id: number) => {
    try { await api.completeReservation(id); setSuccess('Reserva completada'); fetchData(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  const handleExtend = async () => {
    if (!extendId || !newEndTime) return;
    try {
      await api.extendReservation(extendId, newEndTime);
      setSuccess('Reserva extendida'); setExtendId(null); setNewEndTime('');
      fetchData();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2><i className="bi bi-bookmark me-2"></i>Reservas</h2>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <i className="bi bi-plus-circle me-1"></i>Nueva Reserva
          </button>
        )}
      </div>

      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      {showCreate && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white"><h5 className="mb-0">Nueva Reserva</h5></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Fecha inicio * (YYYY-MM-DD HH:MM)</label>
                  <input className="form-control" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} required placeholder="2025-01-15 09:00" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Fecha fin * (YYYY-MM-DD HH:MM)</label>
                  <input className="form-control" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} required placeholder="2025-01-15 17:00" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Equipo</label>
                  <select className="form-select" value={form.equipment_id} onChange={e => setForm(p => ({ ...p, equipment_id: e.target.value }))}>
                    <option value="">Sin equipo</option>
                    {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-success">Crear Reserva</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowCreate(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : reservations.length === 0 ? (
        <div className="alert alert-info">No hay reservas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr><th>ID</th><th>Usuario</th><th>Equipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.username || r.user_id}</td>
                  <td>{r.equipment_name || r.equipment_id || '—'}</td>
                  <td>{r.start_time}</td>
                  <td>{r.end_time}</td>
                  <td><span className={`badge ${statusBadge[r.status] || 'bg-secondary'}`}>{r.status}</span></td>
                  <td>
                    {isAdminOrManager && r.status === 'pending' && (
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleConfirm(r.id)}>
                        <i className="bi bi-check-circle me-1"></i>Confirmar
                      </button>
                    )}
                    {user && r.user_id === user.id && ['confirmed', 'active'].includes(r.status) && (
                      <button className="btn btn-sm btn-outline-warning me-1" onClick={() => { setExtendId(r.id); setNewEndTime(''); }}>
                        <i className="bi bi-clock me-1"></i>Extender
                      </button>
                    )}
                    {isAdminOrManager && ['confirmed', 'active'].includes(r.status) && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleComplete(r.id)}>
                        <i className="bi bi-check2-all me-1"></i>Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Extend Modal */}
      {extendId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setExtendId(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Extender Reserva #{extendId}</h5><button type="button" className="btn-close" onClick={() => setExtendId(null)}></button></div>
              <div className="modal-body">
                <label className="form-label">Nueva fecha fin (YYYY-MM-DD HH:MM)</label>
                <input className="form-control" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} placeholder="2025-01-16 17:00" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setExtendId(null)}>Cancelar</button>
                <button className="btn btn-warning" onClick={handleExtend}>Extender</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
