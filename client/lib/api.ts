const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  cases?: CaseData[];
  state?: string;
}

export interface CaseAnalysisResponse {
  success: boolean;
  analysis: string;
  case_text: string;
  response_time: number;
}

export interface CaseData {
  title: string;
  summary: string;
  court: string;
  date: string;
  link: string;
}

export interface LegalQueryResponse {
  success: boolean;
  answer: string;
  question: string;
  response_time: number;
  cases?: CaseData[];
  state?: string;
}

export interface DocumentAnalysisResponse {
  success: boolean;
  analysis: string;
  response_time: number;
}

export interface NoticeGenerationResponse {
  success: boolean;
  notice: string;
  response_time: number;
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      ...(!options?.body || typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || 'An error occurred');
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(500, 'Network error. Please check your connection.');
  }
}

export async function analyzeCase(caseText: string): Promise<CaseAnalysisResponse> {
  return fetchAPI<CaseAnalysisResponse>('/api/analyze-case/', {
    method: 'POST',
    body: JSON.stringify({ case_text: caseText }),
  });
}

export async function askLegalQuestion(question: string, state?: string): Promise<LegalQueryResponse> {
  return fetchAPI<LegalQueryResponse>('/api/ask-legal-question/', {
    method: 'POST',
    body: JSON.stringify({ question, state }),
  });
}

export async function analyzeDocument(file: File): Promise<DocumentAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-document/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || 'An error occurred');
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(500, 'Network error. Please check your connection.');
  }
}

export async function generateNotice(partyNames: string, issue: string, jurisdiction: string): Promise<NoticeGenerationResponse> {
  return fetchAPI<NoticeGenerationResponse>('/api/generate-notice/', {
    method: 'POST',
    body: JSON.stringify({ party_names: partyNames, issue, jurisdiction }),
  });
}

// Authentication API
export async function login(username: string, password: string) {
  const data = await fetchAPI<any>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (data.access) {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
  }
  return data;
}

export async function register(username: string, email: string, password: string) {
  return fetchAPI<any>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Remote Chat API
export async function fetchRemoteSessions() {
  return fetchAPI<any[]>('/api/chat/sessions/');
}

export async function createRemoteSession(title: string) {
  return fetchAPI<any>('/api/chat/sessions/', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function deleteRemoteSession(sessionId: number) {
  return fetchAPI<void>(`/api/chat/sessions/${sessionId}/`, {
    method: 'DELETE',
  });
}

export async function addMessageToRemoteSession(sessionId: number, content: string, state?: string) {
  return fetchAPI<any>(`/api/chat/sessions/${sessionId}/messages/`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content, state }),
  });
}

export async function syncRemoteSession(sessionData: any) {
  return fetchAPI<any>('/api/chat/sessions/sync/', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}