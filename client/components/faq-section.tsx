"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Is this legal advice?",
      answer:
        "No, our platform provides informational analysis only. It always comes with a disclaimer that this is not legal advice. For actual legal advice, please consult a qualified lawyer.",
    },
    {
      question: "Is the service free to use?",
      answer:
        "Yes, legal analysis is completely free. However, detailed case summary and in-depth analysis may have premium features.",
    },
    {
      question: "How accurate are the predictions?",
      answer:
        "Our AI is trained on thousands of Indian court cases and provides probability-based predictions. Accuracy depends on case complexity and precedent availability.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. Your data is encrypted in transit and at rest. We do not permanently store case descriptions or use them for any other purpose.",
    },
  ]

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
