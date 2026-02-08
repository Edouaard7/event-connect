const API_BASE = 'http://localhost:8000';

interface ApiResponse {
  success?: boolean;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = ApiResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(url, config);
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok && data.error) {
        throw new Error(data.error);
      }
      return data as T;
    }
    
    // For PDF/HTML responses (reports)
    if (contentType.includes('application/pdf') || contentType.includes('text/html')) {
      const blob = await response.blob();
      return { blob, contentType } as unknown as T;
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    return { success: true } as unknown as T;
  }

  // Auth
  login(email: string, password: string) {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: { username: string; email: string; password: string; display_name?: string }) {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    return this.request('/api/logout', { method: 'POST' });
  }

  getMe() {
    return this.request('/api/me');
  }

  // Events
  getEvents() {
    return this.request('/api/events');
  }

  createEvent(data: FormData | Record<string, unknown>) {
    if (data instanceof FormData) {
      return this.request('/api/events', { method: 'POST', body: data });
    }
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  joinEvent(id: number) {
    return this.request(`/api/events/${id}/join`, { method: 'POST' });
  }

  getEventParticipants(id: number) {
    return this.request(`/api/events/${id}/participants`);
  }

  // Equipment
  getEquipment() {
    return this.request('/api/equipment');
  }

  getEquipmentById(id: number) {
    return this.request(`/api/equipment/${id}`);
  }

  createEquipment(data: Record<string, unknown>) {
    return this.request('/api/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEquipment(id: number, data: Record<string, unknown>) {
    return this.request(`/api/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteEquipment(id: number) {
    return this.request(`/api/equipment/${id}`, { method: 'DELETE' });
  }

  // Users
  getUsers() {
    return this.request('/api/users');
  }

  getUserById(id: number) {
    return this.request(`/api/users/${id}`);
  }

  createUser(data: Record<string, unknown>) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateUser(id: number, data: Record<string, unknown>) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteUser(id: number) {
    return this.request(`/api/users/${id}`, { method: 'DELETE' });
  }

  // Reservations
  getReservations(all = false) {
    const query = all ? '?all=1' : '';
    return this.request(`/api/reservations${query}`);
  }

  createReservation(data: Record<string, unknown>) {
    return this.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  confirmReservation(id: number) {
    return this.request(`/api/reservations/${id}/confirm`, { method: 'POST' });
  }

  extendReservation(id: number, new_end_time: string) {
    return this.request(`/api/reservations/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ new_end_time }),
    });
  }

  completeReservation(id: number) {
    return this.request(`/api/reservations/${id}/complete`, { method: 'POST' });
  }

  // Reports
  getReportUrl(type: 'events' | 'equipment' | 'reservations', params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return `${this.baseUrl}/api/reports/${type}${query ? '?' + query : ''}`;
  }
}

export const api = new ApiService(API_BASE);
