export interface ChatSession {
  id: string
  title: string
  firstMessage: string
  createdAt: Date
  updatedAt: Date
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    cases?: any[]
    state?: string
  }>
}

// We no longer use localStorage for persisting sessions.
// Authenticated users will use the backend.
// Anonymous users will only have in-memory sessions that reset on refresh.

export function getAllChatSessions(): ChatSession[] {
  return []
}

export function getChatSession(sessionId: string): ChatSession | null {
  return null
}

export function saveChatSession(session: ChatSession): void {
  // No-op for local storage
}

export function deleteChatSession(sessionId: string): void {
  // No-op for local storage
}

export function createNewSession(firstMessage: string): ChatSession {
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : ''),
    firstMessage,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: []
  }
}

export function generateChatTitle(message: string): string {
  const firstSentence = message.split(/[.!?]/)[0]
  const title = firstSentence.length > 60 
    ? firstSentence.slice(0, 60) + '...'
    : firstSentence
  
  return title.trim()
}