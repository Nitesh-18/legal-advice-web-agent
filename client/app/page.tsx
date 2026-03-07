import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { PrivacySecurity } from "@/components/privacy-security"
import { CaseExplorer } from "@/components/case-explorer"
import { WhyChooseUs } from "@/components/why-choose-us"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <HowItWorks />
        <PrivacySecurity />
        <CaseExplorer />
        <WhyChooseUs />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
