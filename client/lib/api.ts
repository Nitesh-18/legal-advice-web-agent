const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sd0fp1ht-8000.inc1.devtunnels.ms' || 'http://localhost:8000';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface CaseAnalysisResponse {
  success: boolean;
  analysis: string;
  case_text: string;
  response_time: number;
}

export interface LegalQueryResponse {
  success: boolean;
  answer: string;
  question: string;
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
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

export async function askLegalQuestion(question: string): Promise<LegalQueryResponse> {
  return fetchAPI<LegalQueryResponse>('/api/ask-legal-question/', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}