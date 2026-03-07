"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useState } from "react"

export function CaseExplorer() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchText, setSearchText] = useState("")

  const categories = [
    { id: "all", label: "All Cases", count: 10245 },
    { id: "civil", label: "Civil", count: 3202 },
    { id: "criminal", label: "Criminal", count: 4102 },
    { id: "family", label: "Family", count: 2344 },
    { id: "corporate", label: "Corporate", count: 796 },
  ]

  const cases = [
    {
      id: 1,
      category: "Criminal",
      title: "Rajesh Kumar v. State of Maharashtra",
      year: 2023,
      outcome: "Favorable",
      relevance: 85,
    },
    {
      id: 2,
      category: "Civil",
      title: "Priya Sharma v. ABC Corporation Ltd.",
      year: 2023,
      outcome: "Unfavorable",
      relevance: 72,
    },
    {
      id: 3,
      category: "Corporate",
      title: "Tech Solutions Pvt. Ltd v. Revenue Department",
      year: 2022,
      outcome: "Partial Relief",
      relevance: 65,
    },
  ]

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "Favorable":
        return "bg-green-100 text-green-800"
      case "Unfavorable":
        return "bg-red-100 text-red-800"
      case "Partial Relief":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Criminal":
        return "bg-yellow-100 text-yellow-800"
      case "Civil":
        return "bg-blue-100 text-blue-800"
      case "Corporate":
        return "bg-green-100 text-green-800"
      case "Family":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <section id="case-explorer" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Case Explorer</h2>
        <p className="text-muted-foreground">
          Browse through our comprehensive database of Indian court cases and precedents. Find similar cases and
          understand legal patterns.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <Input
            placeholder="Search cases by keywords, court or citation..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Search Cases</Button>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cases.map((caseItem) => (
          <Card key={caseItem.id} className="flex flex-col overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(caseItem.category)}`}>
                {caseItem.category}
              </span>
              <span className="text-sm text-muted-foreground">{caseItem.year}</span>
            </div>

            <div className="px-6 py-4 flex-1">
              <h3 className="font-semibold mb-4 line-clamp-2">{caseItem.title}</h3>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Outcome</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getOutcomeColor(caseItem.outcome)}`}>
                      {caseItem.outcome}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Relevance</span>
                    <span className="text-xs font-medium text-foreground">{caseItem.relevance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${caseItem.relevance}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <Button variant="outline" className="w-full bg-transparent">
                View Reasoning
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Cases
        </Button>
      </div>
    </section>
  )
}
