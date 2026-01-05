import { SUPABASE_URL } from './env';

export interface AdminUser {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AdminSession {
  token: string;
  admin: AdminUser;
}

export interface Job {
  id: string;
  edit_token: string;
  title: string;
  body: string;
  parsed: {
    role: string;
    city: string;
    date: string;
    duration: string;
    hourly: string;
  };
  contact: {
    company: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedData {
  role: string;
  city: string;
  date: string;
  duration: string;
  hourly: string;
}

export interface GeoDetectResult {
  city: string;
}

export class AdminAPI {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(email: string, password: string): Promise<AdminSession> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  }

  async login(email: string, password: string): Promise<AdminSession> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('admin_token', data.token);
    return data;
  }

  async logout(): Promise<void> {
    if (!this.token) return;

    await fetch(`${SUPABASE_URL}/functions/v1/admin-auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    this.token = null;
    localStorage.removeItem('admin_token');
  }

  async getMe(): Promise<AdminUser> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    return data.admin;
  }

  async getJobs(): Promise<Job[]> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-jobs`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs;
  }

  async createJob(job: Partial<Job>): Promise<Job> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create job');
    }

    const data = await response.json();
    return data.job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-jobs/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job');
    }

    const data = await response.json();
    return data.job;
  }

  async updateJobStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Job> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-jobs/${id}/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job status');
    }

    const data = await response.json();
    return data.job;
  }

  async deleteJob(id: string): Promise<void> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-jobs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete job');
    }
  }

  async importCSV(csv: string): Promise<{ imported: number; ids: string[] }> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-import/csv`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'text/csv',
      },
      body: csv,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import CSV');
    }

    return await response.json();
  }

  async scrapeURL(url: string, status: string = 'approved', source: string = 'scrape'): Promise<Job> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-import/scrape`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url, status, source }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape URL');
    }

    const data = await response.json();
    return data.job;
  }

  async extractJobData(prompt: string): Promise<ExtractedData> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uwi-extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract job data');
    }

    return await response.json();
  }

  async detectCity(text: string): Promise<string> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/geo-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to detect city');
    }

    const data: GeoDetectResult = await response.json();
    return data.city;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const adminApi = new AdminAPI();
