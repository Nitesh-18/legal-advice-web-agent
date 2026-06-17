"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeCase, askLegalQuestion, analyzeDocument, Message, APIError, getPredictiveAnalytics, generateNotice } from "@/lib/api"
import { Send, Loader2, AlertCircle, ArrowLeft, Bot, User, Paperclip, X, FileText, Swords, BarChart, Mail } from "lucide-react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { ChatSidebar } from "@/components/ChatSidebar"
import { VoiceInput } from "@/components/VoiceInput"
import {
  ChatSession,
  getChatSession,
  saveChatSession,
  createNewSession,
} from "@/lib/chatStorage"
import { syncRemoteSession, getAuthToken, fetchRemoteSessions } from "@/lib/api"

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isOpposingMode, setIsOpposingMode] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [noticeForm, setNoticeForm] = useState({ partyNames: '', issue: '', jurisdiction: '', emailTo: '' })
  const [noticeStatus, setNoticeStatus] = useState("")
  const [isAuth, setIsAuth] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    setIsAuth(!!getAuthToken())
  }, [])

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
          timestamp: msg.timestamp,
          cases: msg.cases,
          state: msg.state
        })),
        updatedAt: new Date()
      }

      saveChatSession(updatedSession)

      // Also try to sync remotely if authenticated
      if (getAuthToken()) {
        syncRemoteSession(updatedSession).then(res => {
          if (res?.id && res.id !== updatedSession.id) {
            // Update local ID if the server created a new numerical ID
            const newSession = { ...updatedSession, id: res.id.toString() }
            saveChatSession(newSession)
            setCurrentSession(newSession)
          }
        }).catch(err => console.error("Failed to sync session remotely:", err))
      }

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
      if (getAuthToken()) {
        fetchRemoteSessions().then(sessions => {
          const session = sessions.find(s => s.id.toString() === sessionId)
          if (session) {
            console.log("📂 Loading existing remote session")
            const formattedSession = {
              ...session,
              id: session.id.toString(),
              createdAt: new Date(session.updated_at || Date.now()),
              updatedAt: new Date(session.updated_at || Date.now()),
              firstMessage: session.title,
              messages: (session.messages || []).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }))
            }
            setCurrentSession(formattedSession)
            setMessages(formattedSession.messages)
            hasInitialized.current = true
          } else {
            console.log("❌ Session not found, redirecting home")
            router.push('/')
          }
        }).catch(err => {
          console.error("Failed to fetch remote sessions", err)
          router.push('/')
        })
      } else {
        // Anonymous users can't have persistent sessions to load
        router.push('/chat')
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
    } else if (!currentSession) {
      // No session provided in URL and no case param — create a fresh session so user can start typing
      console.log("🆕 Creating new empty chat session")
      const fresh = createNewSession("New Legal Query")
      setCurrentSession(fresh)
      setMessages([])
      if (getAuthToken()) {
        saveChatSession(fresh)
      }
      hasInitialized.current = true
      // Don't update URL for anonymous users so they stay on /chat without a fake ID
      if (getAuthToken()) {
        router.replace(`/chat?session=${fresh.id}`, { scroll: false })
      }
    }
  }, [searchParams, currentSession, router])

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isLoading || isInitializing || !currentSession) return

    const getFriendlyErrorMessage = (error: unknown) => {
      const rawMessage = error instanceof APIError ? error.message : "Failed to get response. Please try again."
      if (/gemini|google ai|high demand|quota|model/i.test(rawMessage)) {
        return "Our legal analysis service is temporarily unavailable. Please try again later."
      }
      return rawMessage
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: selectedFile ? `[File: ${selectedFile.name}]\n${inputValue}` : inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue;
    const currentFile = selectedFile;
    setInputValue("")
    setSelectedFile(null)
    setIsLoading(true)

    const loadingMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      loading: true,
    }

    setMessages(prev => [...prev, loadingMessage])

    try {
      if (currentFile) {
        let docAnalysis: string | null = null;
        let docWarning: string | null = null;

        try {
          const docResponse = await analyzeDocument(currentFile);
          if (docResponse.success) {
            docAnalysis = docResponse.analysis;
          } else {
            // Backend returned partial / extraction failure
            docWarning = (docResponse as any).error || 'Could not extract text from the attached document.';
          }
        } catch (docError) {
          console.warn("⚠️ Document analysis failed, falling back to text query:", docError);
          docWarning = docError instanceof APIError
            ? docError.message
            : 'Could not extract text from the attached document.';
        }

        if (docAnalysis) {
          // Document parsed successfully
          let finalAnswer = `**Document Analysis:**\n${docAnalysis}`;

          if (currentInput.trim()) {
            const qResponse = await askLegalQuestion(`Based on the document context: \n\n${currentInput}`, undefined, isOpposingMode ? 'opposing' : 'standard');
            finalAnswer += `\n\n**Response to Question:**\n${qResponse.answer}`;

            setMessages(prev =>
              prev.map(msg =>
                msg.loading
                  ? { ...msg, content: finalAnswer, cases: qResponse.cases, state: qResponse.state, loading: false, mode: isOpposingMode ? 'opposing' : 'standard' }
                  : msg
              )
            )
          } else {
            setMessages(prev =>
              prev.map(msg =>
                msg.loading
                  ? { ...msg, content: finalAnswer, loading: false }
                  : msg
              )
            )
          }
        } else if (currentInput.trim()) {
          // Document failed but user typed a text query — fall back to text-only
          const fallbackNotice = `> ⚠️ *${docWarning} Proceeding with your text query instead.*\n\n`;
          const response = await askLegalQuestion(currentInput, undefined, isOpposingMode ? 'opposing' : 'standard');

          setMessages(prev =>
            prev.map(msg =>
              msg.loading
                ? { ...msg, content: fallbackNotice + response.answer, cases: response.cases, state: response.state, loading: false, mode: isOpposingMode ? 'opposing' : 'standard' }
                : msg
            )
          )
        } else {
          // Document failed AND no text query
          setMessages(prev =>
            prev.map(msg =>
              msg.loading
                ? { ...msg, content: `⚠️ **Could not process document:** ${docWarning}\n\nPlease try a different file format (PDF, DOCX) or type your legal question directly.`, loading: false }
                : msg
            )
          )
        }
      } else {
        const response = await askLegalQuestion(currentInput, undefined, isOpposingMode ? 'opposing' : 'standard')

        setMessages(prev =>
          prev.map(msg =>
            msg.loading
              ? { ...msg, content: response.answer, cases: response.cases, state: response.state, loading: false, mode: isOpposingMode ? 'opposing' : 'standard' }
              : msg
          )
        )
      }
    } catch (error) {
      console.error("❌ Question failed:", error)
      const errorMessage = getFriendlyErrorMessage(error)

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
    const newSession = createNewSession("New Legal Query");
    setCurrentSession(newSession);
    setMessages([]);
    router.push(`/chat?session=${newSession.id}`);
  }

  const handleFetchAnalytics = async () => {
    if (analyticsData) return; // Prevent re-fetching if already open
    try {
      const res = await getPredictiveAnalytics("General", "High Court");
      if (res.success) {
        setAnalyticsData(res.analytics);
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeStatus("Generating & dispatching notice...");
    try {
      const res = await generateNotice(noticeForm.partyNames, noticeForm.issue, noticeForm.jurisdiction, noticeForm.emailTo);
      if (res.success) {
        setNoticeStatus(res.dispatched ? `✅ ${res.dispatch_message}` : "✅ Notice generated successfully");
        // Add it to the chat!
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: `**Automated Legal Notice Generated:**\n\n${res.notice}\n\n*Status: ${res.dispatch_message || 'Generated'}*`,
          timestamp: new Date()
        }])
        setTimeout(() => setShowNoticeModal(false), 2000);
      } else {
        setNoticeStatus("❌ Failed to generate notice");
      }
    } catch (e) {
      setNoticeStatus("❌ Error generating notice");
    }
  }

  // Debug render
  console.log("🎨 Rendering chat:", {
    messagesCount: messages.length,
    currentSessionId: currentSession?.id,
    isInitializing
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-muted/30 to-background selection:bg-primary/20">
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={currentSession?.id}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-background/40 backdrop-blur-[2px] transition-all duration-300 ${isAuth ? 'ml-80' : ''}`}>
        {/* Header */}
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
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
              <div className="flex items-center gap-3">
                <Button
                  variant={isOpposingMode ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsOpposingMode(!isOpposingMode)}
                  className="transition-all"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  {isOpposingMode ? "Opposing Mode ON" : "Opposing Mode"}
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${message.role === "user"
                          ? "bg-gradient-to-tr from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-2xl rounded-tr-sm"
                          : message.mode === 'opposing'
                            ? "bg-red-50/80 dark:bg-red-950/30 backdrop-blur-xl border border-red-200 dark:border-red-900/50 shadow-md rounded-2xl rounded-tl-sm text-foreground"
                            : "bg-card/80 backdrop-blur-xl border border-border/60 shadow-md rounded-2xl rounded-tl-sm text-foreground"
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

                                {message.cases && message.cases.length > 0 && (
                                  <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                      <Bot className="h-4 w-4" /> Relevant Legal Precedents
                                    </h4>
                                    <div className="grid gap-3">
                                      {message.cases.map((c, idx) => (
                                        <div key={idx} className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group">
                                          <div className="flex justify-between items-start mb-2">
                                            {c.link ? (
                                              <a href={c.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-1 flex-1">
                                                {c.title}
                                              </a>
                                            ) : (
                                              <span className="font-semibold text-foreground line-clamp-1 flex-1">
                                                {c.title}
                                              </span>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-3 whitespace-nowrap bg-muted/80 px-2.5 py-1 rounded-full font-medium">
                                              {c.date}
                                            </span>
                                          </div>
                                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-3">{c.summary}</p>
                                          <div className="text-[10px] font-semibold tracking-wider uppercase bg-primary/10 text-primary inline-flex items-center px-2.5 py-1 rounded-md">
                                            {c.court}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        <div className={`mt-3 text-[10px] uppercase tracking-wider ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-bl from-accent to-accent/50 flex items-center justify-center shadow-inner border border-border/50">
                          <User className="h-5 w-5 text-foreground/80" />
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
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 relative">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mb-4 flex items-start gap-3 text-xs text-muted-foreground bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <p>
                This analysis is for informational purposes only and does not constitute legal advice.
                Please consult with a licensed advocate for formal legal representation.
              </p>
            </div>

            {selectedFile && (
              <div className="mb-3 flex items-center gap-2 bg-muted p-2 rounded-lg text-sm w-fit border">
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-3 relative">
              <label className="flex-shrink-0 cursor-pointer h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 shadow-sm transition-all duration-200 group">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isLoading || isInitializing}
                />
                <Paperclip className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </label>

              <VoiceInput
                disabled={isLoading || isInitializing}
                onTranscript={(text) => setInputValue(prev => prev + text)}
              />

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a follow-up question or upload a document..."
                className="flex-1 min-h-[52px] max-h-[150px] p-4 pr-16 bg-card/50 backdrop-blur-sm border border-border/50 shadow-inner rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                disabled={isLoading || isInitializing}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !selectedFile) || isLoading || isInitializing}
                className="absolute right-2 top-1.5 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-md transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-0.5" />
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleFetchAnalytics}
                >
                  <BarChart className="h-3 w-3 mr-1" /> View Analytics
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => setShowNoticeModal(true)}
                >
                  <Mail className="h-3 w-3 mr-1" /> Draft & Send Notice
                </Button>
              </div>
            )}

            {analyticsData && (
              <div className="mt-4 p-4 bg-card border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold flex items-center gap-2"><BarChart className="h-4 w-4 text-primary" /> Predictive Case Analytics</h4>
                  <Button variant="ghost" size="sm" onClick={() => setAnalyticsData(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Success Probability</p>
                    <p className="text-lg font-bold text-primary">{analyticsData.success_rate_percent}%</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Avg. Duration</p>
                    <p className="text-lg font-bold">{analyticsData.average_duration_months} Months</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Judge Tendency</p>
                    <p className="text-sm font-semibold truncate" title={analyticsData.judge_tendency}>{analyticsData.judge_tendency}</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-muted-foreground text-xs">Historical Cases</p>
                    <p className="text-lg font-bold">{analyticsData.historical_similar_cases}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNoticeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Draft Legal Notice</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNoticeModal(false)}><X className="h-5 w-5" /></Button>
              </div>
              <form onSubmit={handleSendNotice} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Parties Involved</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Ramesh vs Suresh" value={noticeForm.partyNames} onChange={e => setNoticeForm({ ...noticeForm, partyNames: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Issue Description</label>
                  <textarea required className="w-full border rounded-lg p-2 text-sm h-20 resize-none" placeholder="Briefly describe the grievance..." value={noticeForm.issue} onChange={e => setNoticeForm({ ...noticeForm, issue: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Jurisdiction (State/City)</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Delhi" value={noticeForm.jurisdiction} onChange={e => setNoticeForm({ ...noticeForm, jurisdiction: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Recipient Email (Dispatch)</label>
                  <input type="email" required className="w-full border rounded-lg p-2 text-sm" placeholder="tenant@example.com" value={noticeForm.emailTo} onChange={e => setNoticeForm({ ...noticeForm, emailTo: e.target.value })} />
                </div>

                {noticeStatus && <p className="text-sm font-medium text-primary">{noticeStatus}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowNoticeModal(false)}>Cancel</Button>
                  <Button type="submit">Draft & Dispatch</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
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