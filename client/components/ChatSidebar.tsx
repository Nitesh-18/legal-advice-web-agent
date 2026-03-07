"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react"
import { ChatSession, getAllChatSessions, deleteChatSession } from "@/lib/chatStorage"
import { useRouter } from "next/navigation"

interface ChatSidebarProps {
  currentSessionId?: string
  onNewChat: () => void
}

export function ChatSidebar({ currentSessionId, onNewChat }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSessions()
    
    // Listen for storage changes (in case of updates from other tabs)
    const handleStorageChange = () => {
      loadSessions()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab updates
    window.addEventListener('chatSessionsUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('chatSessionsUpdated', handleStorageChange)
    }
  }, [])

  const loadSessions = () => {
    const allSessions = getAllChatSessions()
    setSessions(allSessions)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChatSession(sessionId)
      loadSessions()
      
      // If deleting current session, go to home
      if (sessionId === currentSessionId) {
        router.push('/')
      }
    }
  }

  const handleSelectSession = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return 'Today'
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isCollapsed) {
    return (
      <div className="fixed left-0 top-0 h-full w-16 border-r bg-card z-40 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="mb-4"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
          {sessions.length} chats
        </div>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-80 border-r bg-card z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Chat History</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Sessions List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent group ${
                  currentSessionId === session.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate mb-1">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(session.updatedAt)}</span>
                      <span>•</span>
                      <span>{session.messages.length} msgs</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>💾 Chats saved locally</p>
        <p className="mt-1">Limited to last 50 conversations</p>
      </div>
    </div>
  )
}