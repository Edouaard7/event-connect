import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import AlertMessage from '@/components/AlertMessage';

interface Event {
  id: number;
  title: string;
  description?: string;
  type: string;
  start_at: string;
  end_at: string;
  location?: string;
  capacity?: number;
  allow_registration?: boolean;
}

interface Participant {
  id: number;
  username: string;
  display_name?: string;
  email?: string;
}

export default function EventsPage() {
  const { user, isAdminOrManager } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', start_at: '', end_at: '', location: '',
    type: 'info', capacity: '', allow_registration: false, image: ''
  });

  const fetchEvents = () => {
    setLoading(true);
    api.getEvents()
      .then((data: any) => { if (data.success) setEvents(data.events || []); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleJoin = async (id: number) => {
    setError(''); setSuccess('');
    try {
      await api.joinEvent(id);
      setSuccess('Inscripción exitosa');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al inscribirse');
    }
  };

  const handleViewParticipants = async (event: Event) => {
    setError('');
    try {
      const data: any = await api.getEventParticipants(event.id);
      setParticipants(data.participants || []);
      setSelectedEvent(event);
      setShowParticipants(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar participantes');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title, description: form.description,
        start_at: form.start_at, end_at: form.end_at,
        location: form.location, type: form.type,
        allow_registration: form.allow_registration,
      };
      if (form.capacity) payload.capacity = parseInt(form.capacity);
      if (form.image) payload.image = form.image;
      await api.createEvent(payload);
      setSuccess('Evento creado exitosamente');
      setShowCreate(false);
      setForm({ title: '', description: '', start_at: '', end_at: '', location: '', type: 'info', capacity: '', allow_registration: false, image: '' });
      fetchEvents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear evento');
    } finally {
      setCreating(false);
    }
  };

  const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2><i className="bi bi-calendar-event me-2"></i>Eventos</h2>
        {isAdminOrManager && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <i className="bi bi-plus-circle me-1"></i>Crear Evento
          </button>
        )}
      </div>

      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      {showCreate && isAdminOrManager && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white"><h5 className="mb-0">Nuevo Evento</h5></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Título *</label>
                  <input className="form-control" value={form.title} onChange={e => update('title', e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.type} onChange={e => update('type', e.target.value)}>
                    <option value="info">Información</option>
                    <option value="offer">Oferta</option>
                    <option value="tournament">Torneo</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => update('description', e.target.value)} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha inicio * (YYYY-MM-DD HH:MM)</label>
                  <input className="form-control" value={form.start_at} onChange={e => update('start_at', e.target.value)} required placeholder="2025-01-15 09:00" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha fin * (YYYY-MM-DD HH:MM)</label>
                  <input className="form-control" value={form.end_at} onChange={e => update('end_at', e.target.value)} required placeholder="2025-01-15 17:00" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ubicación</label>
                  <input className="form-control" value={form.location} onChange={e => update('location', e.target.value)} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Capacidad</label>
                  <input type="number" className="form-control" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Imagen (URL)</label>
                  <input className="form-control" value={form.image} onChange={e => update('image', e.target.value)} />
                </div>
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" checked={form.allow_registration} onChange={e => update('allow_registration', e.target.checked)} id="allowReg" />
                <label className="form-check-label" htmlFor="allowReg">Permitir inscripción</label>
              </div>
              <button type="submit" className="btn btn-success" disabled={creating}>
                {creating ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Crear Evento
              </button>
              <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowCreate(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="alert alert-info">No hay eventos registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th><th>Título</th><th>Tipo</th><th>Fecha inicio</th><th>Fecha fin</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.id}</td>
                  <td>{ev.title}</td>
                  <td><span className="badge bg-secondary">{ev.type}</span></td>
                  <td>{ev.start_at}</td>
                  <td>{ev.end_at}</td>
                  <td>
                    {ev.allow_registration && user && (
                      <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleJoin(ev.id)}>
                        <i className="bi bi-person-plus me-1"></i>Inscribirse
                      </button>
                    )}
                    {user && (
                      <button className="btn btn-sm btn-outline-info" onClick={() => handleViewParticipants(ev)}>
                        <i className="bi bi-people me-1"></i>Participantes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipants && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowParticipants(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Participantes - {selectedEvent?.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowParticipants(false)}></button>
              </div>
              <div className="modal-body">
                {participants.length === 0 ? (
                  <p className="text-muted">No hay participantes inscritos.</p>
                ) : (
                  <table className="table table-sm">
                    <thead><tr><th>ID</th><th>Username</th><th>Nombre</th></tr></thead>
                    <tbody>
                      {participants.map(p => (
                        <tr key={p.id}><td>{p.id}</td><td>{p.username}</td><td>{p.display_name || '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
