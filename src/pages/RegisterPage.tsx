import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AlertMessage from '@/components/AlertMessage';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (form.username.length < 3) return 'El nombre de usuario debe tener al menos 3 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">
                <i className="bi bi-person-plus me-2"></i>Registro
              </h3>
              {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre de usuario *</label>
                  <input className="form-control" value={form.username} onChange={e => update('username', e.target.value)} required minLength={3} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña *</label>
                  <input type="password" className="form-control" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre para mostrar</label>
                  <input className="form-control" value={form.display_name} onChange={e => update('display_name', e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Registrarse
                </button>
              </form>
              <p className="text-center mt-3 mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
