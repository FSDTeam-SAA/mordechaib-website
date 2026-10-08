import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Will Noltra work inside our existing tech stack?",
    answer:
      "Yes. Your AI Chief of Staff integrates directly with the systems you already use: CRMs, support platforms, scheduling tools, and internal dashboards.",
  },
  {
    question: "How quickly can we get started?",
    answer:
      "Most teams are live within a day. Noltra begins capturing tasks, updating systems, and generating your daily brief as soon as workflows are connected.",
  },
  {
    question: "Do we need a long-term contract?",
    answer:
      "No. Noltra is month-to-month. Scale up or down as your operation grows.",
  },
  {
    question: "Does Noltra handle training?",
    answer:
      "Yes. Your agents learn from your calls, messages, and workflows. We guide setup, record training where needed, and continuously refine your AI workforce.",
  },
  {
    question: "Can Noltra support peak periods?",
    answer:
      "Absolutely. Your AI workforce scales instantly: no hiring, no onboarding, no bottlenecks. High-volume days become predictable and manageable.",
  },
  {
    question: "How quickly can we get started?",
    answer:
      "You can start with a small workflow and expand once your team sees the time savings.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="bg-[#F5F7FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="container mx-auto grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF014] px-3 py-1.5 text-xs font-medium text-[#5B7FF0]">
            <HelpCircle size={13} />
            FAQ
          </div>
          <h2 className="text-[28px] font-bold leading-tight text-[#0E1224] sm:text-4xl sm:leading-tight lg:text-[64px] lg:leading-tight">
            Questions
            <br />
            <span className="text-[#5B7FF0]">CEOs</span> Ask Most
          </h2>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={`${faq.question}-${index}`} value={`item-${index}`} className="border-[#C9D1E6]">
              <AccordionTrigger className="group py-4 text-left text-base font-medium leading-snug text-[#0E1224] hover:no-underline sm:text-xl [&>svg]:hidden">
                <span>{faq.question}</span>
                <span className="ml-4 text-xl font-normal text-[#0E1224] group-data-[state=open]:hidden">
                  +
                </span>
                <span className="ml-4 hidden text-xl font-normal text-[#0E1224] group-data-[state=open]:block">
                  -
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-[720px] pb-4 text-[13px] leading-relaxed text-[#6B6B6B] sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
