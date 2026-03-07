import { Card } from "@/components/ui/card"
import { Zap, BookOpen, Clock } from "lucide-react"

export function WhyChooseUs() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced AI model trained on thousands of Indian court cases for accurate legal insights.",
    },
    {
      icon: BookOpen,
      title: "Precedent-Based",
      description:
        "Get insights based on similar cases from Indian courts with detailed case citations and references.",
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get case clarification, outcome predictions, and next steps in minutes, not hours.",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Legal Advice Web Agent?</h2>
        <p className="text-muted-foreground">
          Get instant legal insights powered by AI analysis of Indian court precedents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="bg-gradient-to-br from-secondary to-secondary/50">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
