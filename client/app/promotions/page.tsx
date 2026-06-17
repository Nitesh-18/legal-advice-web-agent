"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Building, Briefcase } from "lucide-react"

// Mock state for law firms
const initialFirms = [
  {
    id: 1,
    name: "Justice & Partners",
    city: "New Delhi",
    practiceAreas: ["Corporate Law", "Intellectual Property", "Taxation"],
    contact: { email: "contact@justicepartners.in", phone: "+91 98765 43210" },
    description: "Leading firm specializing in enterprise legal solutions and IP rights protection."
  },
  {
    id: 2,
    name: "Vyas Legal Associates",
    city: "Mumbai",
    practiceAreas: ["Criminal Defense", "Family Law", "Civil Litigation"],
    contact: { email: "info@vyaslegal.in", phone: "+91 87654 32109" },
    description: "Experienced advocates dedicated to protecting your rights in complex litigations."
  },
  {
    id: 3,
    name: "TechLaw Solutions",
    city: "Bengaluru",
    practiceAreas: ["Cyber Law", "Data Privacy", "Startup Advisory"],
    contact: { email: "hello@techlaw.co.in", phone: "+91 76543 21098" },
    description: "Modern legal advice tailored for technology companies and digital startups."
  }
]

export default function PromotionsPage() {
  const [firms, setFirms] = useState(initialFirms)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    practiceAreas: "",
    email: "",
    phone: "",
    description: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    
    // Basic validation
    if (!formData.name || !formData.city || !formData.email || !formData.practiceAreas) {
      setFormError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    setTimeout(() => {
      const newFirm = {
        id: Date.now(),
        name: formData.name,
        city: formData.city,
        practiceAreas: formData.practiceAreas.split(",").map(s => s.trim()).filter(Boolean),
        contact: { email: formData.email, phone: formData.phone },
        description: formData.description
      }
      
      setFirms([newFirm, ...firms])
      setSubmitSuccess(true)
      setIsSubmitting(false)
      setFormData({ name: "", city: "", practiceAreas: "", email: "", phone: "", description: "" })
      
      setTimeout(() => setSubmitSuccess(false), 5000)
    }, 800)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Law Firm Directory</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover top-rated legal professionals or list your own practice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Submission Form */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="text-primary" size={20} />
                    List Your Firm
                  </CardTitle>
                  <CardDescription>Join our directory of verified legal professionals.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {submitSuccess && (
                      <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm text-center">
                        Your firm has been listed successfully!
                      </div>
                    )}
                    {formError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">
                        {formError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Firm Name *</label>
                      <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sharma & Co." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. New Delhi" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Practice Areas *</label>
                      <Input name="practiceAreas" value={formData.practiceAreas} onChange={handleChange} placeholder="Comma separated" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contact@firm.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Short Description</label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Briefly describe your firm..." className="resize-none" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Listing"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>

            {/* Right Col: Listing Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {firms.map(firm => (
                  <Card key={firm.id} className="border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-3 border-b border-border/30">
                      <CardTitle className="text-xl text-primary truncate" title={firm.name}>{firm.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin size={14} className="mr-1" />
                        {firm.city}
                      </div>
                    </CardHeader>
                    <CardContent className="py-4 space-y-4">
                      <p className="text-sm text-foreground/80 line-clamp-2" title={firm.description}>
                        {firm.description || "No description provided."}
                      </p>
                      
                      <div>
                        <div className="flex items-center text-xs font-semibold text-muted-foreground mb-2">
                          <Briefcase size={12} className="mr-1" /> PRACTICE AREAS
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {firm.practiceAreas.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-xs font-medium border border-border/50">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/30 bg-muted/10 flex flex-col items-start gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center truncate w-full" title={firm.contact.email}>
                        <Mail size={14} className="mr-2 text-primary/70 shrink-0" />
                        <span className="truncate">{firm.contact.email}</span>
                      </div>
                      {firm.contact.phone && (
                        <div className="flex items-center truncate w-full">
                          <Phone size={14} className="mr-2 text-primary/70 shrink-0" />
                          <span>{firm.contact.phone}</span>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
