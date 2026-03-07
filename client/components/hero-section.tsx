"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, Clock, BookOpen } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [caseText, setCaseText] = useState("")
  const router = useRouter()

  const handleAnalyzeCase = () => {
    if (!caseText.trim()) {
      alert("Please enter your case description")
      return
    }

    // Navigate to chat page with case text
    router.push(`/chat?case=${encodeURIComponent(caseText)}`)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-secondary-foreground">
              India-focused • AI-driven • Cites Sources
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
            Legal clarity from your one-paragraph summary
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            Analyze Indian court cases and get legal insights in minutes. Our AI analyzes legal documents to provide you
            with actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-base">
              Start Free Assessment
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              See How It Works
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <div className="flex items-center gap-2">
              <Lock className="text-primary" size={20} />
              <span className="text-sm text-foreground">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              <span className="text-sm text-foreground">Results in Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-primary" size={20} />
              <span className="text-sm text-foreground">10,000+ Precedents</span>
            </div>
          </div>
        </div>

        {/* Right Side - Analysis Card */}
        <div>
          <Card className="border-2 border-border">
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold mb-2">Try a Quick Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your legal situation in 4-5 lines. Our AI understands over 500 relevant cases to provide legal
                insights.
              </p>
            </div>
            <div className="px-6">
              <textarea
                value={caseText}
                onChange={(e) => setCaseText(e.target.value)}
                placeholder="Enter your legal problem description here..."
                className="w-full h-32 p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div className="px-6 py-6 space-y-4">
              <Button 
                className="w-full text-base" 
                size="lg"
                onClick={handleAnalyzeCase}
                disabled={!caseText.trim()}
              >
                Analyze Case
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This analysis is for informational purposes only and does not constitute legal advice.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}