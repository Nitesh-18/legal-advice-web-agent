import { Card } from "@/components/ui/card"
import { FileText, Search, Lightbulb } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Submit Your Case",
      description:
        "Describe your legal situation in 4-5 lines. Our AI understands context and extracts key information.",
      features: ["Weight not void", "Automated analysis", "Privacy protected"],
    },
    {
      icon: Search,
      title: "Analyze Precedents",
      description:
        "Our AI searches through thousands of Indian court cases to find relevant precedents and legal principles.",
      features: ["Habits Law Matching", "Pattern recognition", "Contextual matching"],
    },
    {
      icon: Lightbulb,
      title: "Get Insights",
      description: "Receive detailed analysis with user-understandable predictions, outcome analysis, and next steps.",
      features: ["Outcome predictions", "Case citations", "Clear explanation"],
    },
  ]

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get legal clarity in three simple steps. Our AI-powered platform makes complex legal analysis accessible to
          everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card key={index} className="flex flex-col">
              <div className="px-6 py-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">{step.description}</p>
                <ul className="space-y-2">
                  {step.features.map((feature, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
