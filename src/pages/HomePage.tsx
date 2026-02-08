import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Spinner from '@/components/Spinner';
import AlertMessage from '@/components/AlertMessage';

interface Event {
  id: number;
  title: string;
  type: string;
  start_at: string;
  end_at: string;
  location?: string;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEvents()
      .then((data: any) => {
        if (data.success && data.events) {
          const now = new Date();
          const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const upcoming = data.events.filter((e: Event) => {
            const start = new Date(e.start_at);
            const end = new Date(e.end_at);
            // In progress or starting within 24h
            return (start <= now && end >= now) || (start >= now && start <= in24h);
          });
          setEvents(upcoming);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-4">
      <h2><i className="bi bi-house me-2"></i>Eventos Próximos</h2>
      <hr />
      {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="alert alert-info">No hay eventos próximos.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th><th>Título</th><th>Tipo</th><th>Fecha inicio</th><th>Fecha fin</th><th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.title}</td>
                  <td><span className="badge bg-secondary">{e.type}</span></td>
                  <td>{e.start_at}</td>
                  <td>{e.end_at}</td>
                  <td>{e.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
