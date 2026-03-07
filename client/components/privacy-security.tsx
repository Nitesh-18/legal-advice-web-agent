import { Shield, Lock, Eye, CheckCircle } from "lucide-react"

export function PrivacySecurity() {
  const features = [
    {
      icon: Lock,
      title: "Encrypted Data",
      description: "All submissions are encrypted and securely processed",
    },
    {
      icon: Shield,
      title: "No Storage",
      description: "Your case details are not permanently stored",
    },
    {
      icon: Eye,
      title: "Anonymous",
      description: "No personal identification required for analysis",
    },
    {
      icon: CheckCircle,
      title: "Compliant",
      description: "Follows Indian data protection regulations",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-secondary/30 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Privacy & Security Assurance</h2>
        <p className="text-muted-foreground">Your data is protected with enterprise-grade security standards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon className="text-primary" size={24} />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
