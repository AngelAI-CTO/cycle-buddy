const API_BASE = "http://localhost:8000/api";

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Auth
export const auth = {
  register: (username: string, password: string) =>
    request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

// Partners
export interface Partner {
  id: number;
  name: string;
  cycle_length: number;
  period_length: number;
}

export interface CycleStatus {
  partner_name: string;
  phase: string;
  phase_name: string;
  emoji: string;
  day_in_cycle: number;
  cycle_length: number;
  days_left_in_phase: number;
  days_until_next_period: number;
  next_period_date: string;
  mood: string;
  energy: string;
  tips: string[];
  avoid: string[];
}

export interface ForecastDay {
  date: string;
  day_of_week: string;
  phase: string;
  phase_name: string;
  emoji: string;
  mood: string;
  energy: string;
}

export const partners = {
  list: () => request<Partner[]>("/partners/"),

  create: (name: string, cycleLength = 28, periodLength = 5) =>
    request<Partner>("/partners/", {
      method: "POST",
      body: JSON.stringify({
        name,
        cycle_length: cycleLength,
        period_length: periodLength,
      }),
    }),

  delete: (id: number) =>
    request<void>(`/partners/${id}`, { method: "DELETE" }),

  addCycle: (partnerId: number, startDate: string) =>
    request<{ id: number }>(`/partners/${partnerId}/cycles`, {
      method: "POST",
      body: JSON.stringify({ start_date: startDate }),
    }),

  getStatus: (partnerId: number) =>
    request<CycleStatus>(`/partners/${partnerId}/status`),

  getForecast: (partnerId: number, days = 14) =>
    request<{ partner_name: string; forecast: ForecastDay[] }>(
      `/partners/${partnerId}/forecast?days=${days}`
    ),
};
