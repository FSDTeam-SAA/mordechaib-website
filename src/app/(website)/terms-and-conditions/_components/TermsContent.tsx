"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

interface TermsSection {
  id: string;
  title: string;
  content: Array<string | { text: string; bullets?: string[] }>;
}

const termsSections: TermsSection[] = [
  {
    id: "section-1",
    title: "Introduction",
    content: [
      "Welcome to Noltra.ai. These Terms & Conditions govern your access to and use of our AI-powered business operating system, including all features, AI agents, automation tools, and related services.",
      "By creating an account or using Noltra.ai, you agree to comply with these terms. If you do not agree with any part of these Terms & Conditions, please discontinue use of the platform.",
    ],
  },
  {
    id: "section-2",
    title: "User Accounts",
    content: [
      "To access Noltra.ai, you must create an account using accurate and up-to-date information. You are responsible for maintaining the security of your account and for all activities performed under it.",
      {
        text: "As a user, you agree to:",
        bullets: [
          "Provide accurate registration information.",
          "Keep your login credentials secure.",
          "Manage team member access responsibly.",
          "Notify us immediately if you suspect unauthorized access.",
        ],
      },
    ],
  },
  {
    id: "section-3",
    title: "Acceptable Use",
    content: [
      {
        text: "Noltra.ai is designed to support legitimate business operations and productivity. Users must use the platform responsibly and in compliance with applicable laws. You agree not to:",
        bullets: [
          "Use the platform for illegal or fraudulent activities.",
          "Upload malicious software or harmful content.",
          "Attempt unauthorized access to any account or system.",
          "Interfere with the platform's security or performance.",
          "Misuse AI-generated content in violation of applicable laws.",
        ],
      },
      "Violation of these rules may result in temporary suspension or permanent termination of your account.",
    ],
  },
  {
    id: "section-4",
    title: "AI Services & Responsibilities",
    content: [
      "Noltra.ai uses artificial intelligence to automate workflows, generate insights, summarize conversations, and assist with business operations.",
      "While we continuously improve the accuracy of our AI services, AI-generated recommendations should be treated as guidance rather than professional advice. Users remain responsible for reviewing, verifying, and approving all AI-generated content before making business decisions.",
    ],
  },
  {
    id: "section-5",
    title: "Subscription & Billing",
    content: [
      "Certain features require an active subscription. By subscribing to a paid plan, you agree to the applicable pricing and billing terms.",
      {
        text: "Your subscription may include:",
        bullets: [
          "Monthly or annual billing cycles.",
          "Automatic renewal unless cancelled.",
          "Access to premium AI features.",
          "Plan upgrades or downgrades.",
          "Billing history and payment management.",
        ],
      },
      "Failure to complete payments may result in limited access to premium services.",
    ],
  },
  {
    id: "section-6",
    title: "Data & Privacy",
    content: [
      "Your privacy and business data are important to us. Information such as contacts, documents, voice recordings, and workflow data is processed only to deliver and improve our services. We apply industry-standard security practices to protect your information and handle all personal data in accordance with our Privacy Policy.",
    ],
  },
  {
    id: "section-7",
    title: "Intellectual Property",
    content: [
      "All software, platform design, AI technologies, branding, logos, documentation, and related materials are the exclusive property of Noltra.ai or its licensors.",
      {
        text: "Without prior written permission, you may not:",
        bullets: [
          "Copy or reproduce platform content.",
          "Modify or redistribute our software.",
          "Use Noltra.ai branding or logos commercially.",
          "Create derivative works based on our platform.",
        ],
      },
    ],
  },
  {
    id: "section-8",
    title: "Limitation of Liability",
    content: [
      "To the fullest extent permitted by law, Noltra.ai shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform. This includes business interruptions, data loss, missed opportunities, or reliance on AI-generated recommendations. Users remain responsible for evaluating AI outputs before making important business decisions.",
    ],
  },
  {
    id: "section-9",
    title: "Changes to These Terms",
    content: [
      "We may update these Terms & Conditions from time to time to reflect platform improvements, legal requirements, or operational changes. Significant updates will be communicated through the platform or by email when appropriate. Continued use of Noltra.ai after changes become effective constitutes acceptance of the updated Terms & Conditions.",
    ],
  },
  {
    id: "section-10",
    title: "Contact Information",
    content: [
      "If you have any questions, concerns, or requests regarding these Terms & Conditions, our support team is here to help.",
      {
        text: "Contact Information:",
        bullets: [
          "Email: legal@noltra.ai",
          "Website: www.noltra.ai",
          "Business Hours: Monday – Friday, 9:00 AM – 6:00 PM",
          "Response Time: Within 1–2 business days",
        ],
      },
    ],
  },
];

function TermsContent() {
  const [activeId, setActiveId] = useState("section-1");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      for (const section of termsSections) {
        const element = document.getElementById(section.id);
        if (
          element &&
          scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight
        ) {
          setActiveId(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto grid container grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-12 lg:px-8 xl:gap-16">
        <aside className="">
          <div className="lg:sticky lg:top-24 ">
            <h2 className="mb-4 text-lg font-semibold text-[#264AFF]">Contents</h2>
            <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0 border-l  ">
              {termsSections.map((section, index) => {
                const isActive = activeId === section.id;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => scrollToSection(event, section.id)}
                    className={`shrink-0 border-l-2 px-3 py-2 text-base font-semibold transition-colors lg:block ${
                      isActive
                        ? "border-[#264AFF] text-[#264AFF]"
                        : "border-transparent text-[#929BBB] hover:text-[#315CF6]"
                    }`}
                  >
                    {index + 1}. {section.title}
                  </a>
                );
              })}
            </nav>

            <div className="mt-7 hidden pl-3 lg:block">
              <h3 className="text-lg font-bold text-[#315CF6]">Need help?</h3>
              <p className="mt-2 max-w-[250px] text-[14px] leading-[1.35] text-[#8B93B8]">
                Questions about these terms? Our legal team is here to assist.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-9 flex items-start gap-3 rounded-[12px] border border-[#F59E0B] bg-[#F59E0B1A] px-4 py-2.5 text-[#F59E0B]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p className="text-[11px] leading-snug sm:text-sm font-normal">
              <span className="font-bold">Summary:</span> By using Noltra, you agree to use the platform lawfully, keep your credentials secure, and understand that AI outputs require human review. Your data is private - we never train shared models on it.
            </p>
          </div>

          <div className="space-y-9 sm:space-y-10">
            {termsSections.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="typography-h2-section mb-2 text-[#141936]">
                  {sectionIndex + 1}. {section.title}
                </h2>
                <div className="space-y-2 text-xs leading-relaxed text-[#929BBB] sm:text-sm">
                  {section.content.map((block, blockIndex) =>
                    typeof block === "string" ? (
                      <p key={blockIndex}>{block}</p>
                    ) : (
                      <div key={blockIndex} className="space-y-2">
                        <p>{block.text}</p>
                        {block.bullets && (
                          <ul className="space-y-2 pl-1">
                            {block.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-2">
                                <span className="text-[#8B93B8]">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}

export default TermsContent;
