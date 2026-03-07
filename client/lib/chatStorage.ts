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
  }>
}

const STORAGE_KEY = 'legal_chat_sessions'

export function getAllChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const sessions = JSON.parse(stored)
    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }))
  } catch (error) {
    console.error('Error loading chat sessions:', error)
    return []
  }
}

export function getChatSession(sessionId: string): ChatSession | null {
  const sessions = getAllChatSessions()
  return sessions.find(s => s.id === sessionId) || null
}

export function saveChatSession(session: ChatSession): void {
  if (typeof window === 'undefined') return
  
  try {
    const sessions = getAllChatSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.unshift(session) // Add new session at the beginning
    }
    
    // Keep only last 50 sessions
    const trimmedSessions = sessions.slice(0, 50)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSessions))
  } catch (error) {
    console.error('Error saving chat session:', error)
  }
}

export function deleteChatSession(sessionId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const sessions = getAllChatSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting chat session:', error)
  }
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
  // Extract first sentence or first 60 chars
  const firstSentence = message.split(/[.!?]/)[0]
  const title = firstSentence.length > 60 
    ? firstSentence.slice(0, 60) + '...'
    : firstSentence
  
  return title.trim()
}