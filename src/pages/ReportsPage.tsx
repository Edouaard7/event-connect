import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

export default function ReportsPage() {
  const { isAdminOrManager } = useAuth();
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '' });
  const [iframeUrl, setIframeUrl] = useState('');

  if (!isAdminOrManager) return <div className="container mt-4"><div className="alert alert-danger">Acceso denegado.</div></div>;

  const buildParams = (extra: Record<string, string> = {}) => {
    const params: Record<string, string> = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.status) params.status = filters.status;
    return { ...params, ...extra };
  };

  const openReport = (type: 'events' | 'equipment' | 'reservations') => {
    const url = api.getReportUrl(type, buildParams());
    window.open(url, '_blank');
  };

  const viewInline = (type: 'events' | 'equipment' | 'reservations') => {
    const url = api.getReportUrl(type, buildParams());
    setIframeUrl(url);
  };

  const update = (field: string, value: string) => setFilters(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container mt-4">
      <h2><i className="bi bi-file-earmark-bar-graph me-2"></i>Reportes</h2>
      <hr />

      <div className="card mb-4">
        <div className="card-header"><h5 className="mb-0">Filtros</h5></div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha inicio</label>
              <input type="date" className="form-control" value={filters.start_date} onChange={e => update('start_date', e.target.value)} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha fin</label>
              <input type="date" className="form-control" value={filters.end_date} onChange={e => update('end_date', e.target.value)} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Estado (reservas/equipos)</label>
              <input className="form-control" value={filters.status} onChange={e => update('status', e.target.value)} placeholder="pending, available, etc." />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title"><i className="bi bi-calendar-event me-2"></i>Eventos</h5>
              <p className="card-text">Reporte de eventos con conteo de participantes.</p>
              <button className="btn btn-primary me-2" onClick={() => openReport('events')}>
                <i className="bi bi-box-arrow-up-right me-1"></i>Abrir PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={() => viewInline('events')}>
                <i className="bi bi-eye me-1"></i>Ver inline
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title"><i className="bi bi-tools me-2"></i>Equipos</h5>
              <p className="card-text">Inventario completo de equipos.</p>
              <button className="btn btn-primary me-2" onClick={() => openReport('equipment')}>
                <i className="bi bi-box-arrow-up-right me-1"></i>Abrir PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={() => viewInline('equipment')}>
                <i className="bi bi-eye me-1"></i>Ver inline
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title"><i className="bi bi-bookmark me-2"></i>Reservas</h5>
              <p className="card-text">Listado de reservas con estados.</p>
              <button className="btn btn-primary me-2" onClick={() => openReport('reservations')}>
                <i className="bi bi-box-arrow-up-right me-1"></i>Abrir PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={() => viewInline('reservations')}>
                <i className="bi bi-eye me-1"></i>Ver inline
              </button>
            </div>
          </div>
        </div>
      </div>

      {iframeUrl && (
        <div className="card mt-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Vista previa del reporte</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setIframeUrl('')}>Cerrar</button>
          </div>
          <div className="card-body p-0">
            <iframe src={iframeUrl} style={{ width: '100%', height: '600px', border: 'none' }} title="Reporte" />
          </div>
        </div>
      )}
    </div>
  );
}
