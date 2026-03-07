"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeCase, askLegalQuestion, Message, APIError } from "@/lib/api"
import { Send, Loader2, AlertCircle, ArrowLeft, Bot, User } from "lucide-react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { ChatSidebar } from "@/components/ChatSidebar"
import { 
  ChatSession, 
  getChatSession, 
  saveChatSession, 
  createNewSession,
} from "@/lib/chatStorage"

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save session whenever messages change
  useEffect(() => {
    if (currentSession && messages.length > 0 && !isInitializing) {
      const updatedSession: ChatSession = {
        ...currentSession,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        updatedAt: new Date()
      }
      
      saveChatSession(updatedSession)
      window.dispatchEvent(new Event('chatSessionsUpdated'))
    }
  }, [messages, currentSession, isInitializing])

  // Load session or start new chat
  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) return
    
    const sessionId = searchParams.get("session")
    const caseParam = searchParams.get("case")
    
    console.log("🔍 Initializing chat:", { sessionId, caseParam })

    if (sessionId) {
      // Load existing session
      const session = getChatSession(sessionId)
      if (session) {
        console.log("📂 Loading existing session:", session)
        setCurrentSession(session)
        setMessages(session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
        hasInitialized.current = true
      } else {
        console.log("❌ Session not found, redirecting home")
        router.push('/')
      }
    } else if (caseParam && !currentSession) {
      console.log("🆕 Starting new chat with case")
      hasInitialized.current = true
      setIsInitializing(true)
      
      // New chat from case submission
      const newSession = createNewSession(caseParam)
      setCurrentSession(newSession)
      
      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: caseParam,
        timestamp: new Date(),
      }
      
      // Add loading message
      const loadingMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        loading: true,
      }
      
      console.log("➕ Adding initial messages")
      setMessages([userMessage, loadingMessage])
      
      // Analyze case
      console.log("🤖 Calling analyzeCase API...")
      analyzeCase(caseParam)
        .then((response) => {
          console.log("✅ Analysis received:", {
            success: response.success,
            contentLength: response.analysis?.length,
            responseTime: response.response_time
          })
          
          setMessages(prev => {
            const updated = prev.map(msg => {
              if (msg.loading) {
                console.log("🔄 Updating loading message with content")
                return {
                  ...msg,
                  content: response.analysis,
                  loading: false
                }
              }
              return msg
            })
            console.log("📝 Messages after update:", updated)
            return updated
          })
          
          setIsInitializing(false)
        })
        .catch((error) => {
          console.error("❌ Analysis failed:", error)
          const errorMessage = error instanceof APIError 
            ? error.message 
            : "Failed to analyze case. Please try again."
          
          setMessages(prev => 
            prev.map(msg => 
              msg.loading 
                ? { 
                    ...msg, 
                    content: `❌ **Error:** ${errorMessage}\n\nPlease try again or ask a different question.`, 
                    loading: false 
                  }
                : msg
            )
          )
          
          setIsInitializing(false)
        })
      
      // Update URL with session ID
      router.replace(`/chat?session=${newSession.id}`, { scroll: false })
    }
  }, [searchParams, currentSession, router])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSession) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Add loading message
    const loadingMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      loading: true,
    }

    setMessages(prev => [...prev, loadingMessage])

    try {
      console.log("🤖 Sending question:", inputValue)
      const response = await askLegalQuestion(inputValue)
      console.log("✅ Question answered:", {
        success: response.success,
        contentLength: response.answer?.length
      })
      
      setMessages(prev => 
        prev.map(msg => 
          msg.loading 
            ? { ...msg, content: response.answer, loading: false }
            : msg
        )
      )
    } catch (error) {
      console.error("❌ Question failed:", error)
      const errorMessage = error instanceof APIError 
        ? error.message 
        : "Failed to get response. Please try again."
      
      setMessages(prev => 
        prev.map(msg => 
          msg.loading 
            ? { 
                ...msg, 
                content: `❌ **Error:** ${errorMessage}`, 
                loading: false 
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = () => {
    hasInitialized.current = false
    router.push('/')
  }

  // Debug render
  console.log("🎨 Rendering chat:", {
    messagesCount: messages.length,
    currentSessionId: currentSession?.id,
    isInitializing
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar 
        currentSessionId={currentSession?.id}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ml-80">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">
                    {currentSession?.title || "Legal Case Analysis"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    AI-powered insights based on Indian law
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>AI Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="space-y-6 mb-32">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}

                    <Card
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      }`}
                    >
                      <div className="p-4">
                        {message.loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing your case with AI...</span>
                          </div>
                        ) : (
                          <>
                            {message.role === "user" ? (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                            ) : (
                              <div>
                                {/* Debug: Show raw content length */}
                                {process.env.NODE_ENV === 'development' && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Content length: {message.content?.length || 0} chars
                                  </div>
                                )}
                                <MarkdownRenderer content={message.content || "No content"} />
                              </div>
                            )}
                          </>
                        )}
                        <div className={`mt-2 text-xs ${message.role === "user" ? "opacity-80" : "opacity-60"}`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </Card>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="mb-3 flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <p>
                This analysis is for informational purposes only and does not constitute legal advice. 
                Please consult with a licensed advocate for formal legal representation.
              </p>
            </div>

            <div className="flex gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a follow-up question about your case..."
                className="flex-1 min-h-[60px] max-h-[150px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isInitializing}
              />
              <Button
                size="lg"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isInitializing}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {messages.length > 0 && !isLoading && !isInitializing && (
              <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground w-full mb-1">
                  Suggested follow-ups:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputValue("What are the applicable laws in my case?")}
                >
                  Applicable laws
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputValue("What are my next steps?")}
                >
                  Next steps
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputValue("What documents do I need?")}
                >
                  Required documents
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}