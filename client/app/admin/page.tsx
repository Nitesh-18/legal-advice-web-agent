"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface QueryLog {
  id: number;
  timestamp: string;
  user: string;
  query_type: string;
  question_preview: string;
  response_time: number;
  error_occurred: boolean;
}

export default function AdminDashboard() {
  const [queries, setQueries] = useState<QueryLog[]>([])
  const [filteredQueries, setFilteredQueries] = useState<QueryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Filters
  const [typeFilter, setTypeFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("")
  
  // Pagination
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  
  const router = useRouter()

  useEffect(() => {
    const fetchQueries = async () => {
      const token = getAuthToken()
      if (!token) {
        router.push('/login')
        return
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/admin/queries/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.status === 403) {
          setError("Unauthorized: You do not have admin access.")
          setIsLoading(false)
          return
        }
        
        if (!response.ok) throw new Error("Failed to fetch")
        
        const data = await response.json()
        setQueries(data.queries)
        setFilteredQueries(data.queries)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchQueries()
  }, [router])
  
  useEffect(() => {
    let result = queries
    
    if (typeFilter !== "All") {
      result = result.filter(q => q.query_type === typeFilter)
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString()
      result = result.filter(q => new Date(q.timestamp).toDateString() === filterDate)
    }
    
    setFilteredQueries(result)
    setPage(1)
  }, [typeFilter, dateFilter, queries])
  
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage)
  const paginated = filteredQueries.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  const queryTypes = ["All", ...Array.from(new Set(queries.map(q => q.query_type)))]

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => router.push('/')}>Back to Site</Button>
        </div>
        
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">System Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-sm font-medium">Query Type</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {queryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Date</label>
                <Input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  className="bg-background"
                />
              </div>
              <div className="flex items-end">
                <Button variant="secondary" onClick={() => { setTypeFilter("All"); setDateFilter(""); }}>
                  Clear Filters
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border border-border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Preview</th>
                    <th className="px-4 py-3 font-medium">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map((q) => (
                    <tr key={q.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(q.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">{q.user}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {q.query_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate" title={q.question_preview}>{q.question_preview}</td>
                      <td className="px-4 py-3 font-mono">{q.response_time ? q.response_time.toFixed(2) : '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No queries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredQueries.length)} of {filteredQueries.length}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
