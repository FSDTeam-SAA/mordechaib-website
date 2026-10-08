"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

interface PrivacySection {
  id: string;
  title: string;
  content: Array<string | { text: string; bullets?: string[] }>;
}

const privacySections: PrivacySection[] = [
  {
    id: "section-1",
    title: "Introduction",
    content: [
      "At Noltra, we are committed to protecting your privacy and ensuring the security of your personal and business information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our AI-powered business operating system.",
    ],
  },
  {
    id: "section-2",
    title: "Information We Collect",
    content: [
      {
        text: "We collect information that helps us provide and improve our services. This may include:",
        bullets: [
          "Personal information such as your name, email address, and contact details.",
          "Organization and workspace information.",
          "CRM records, contacts, and uploaded documents.",
          "Voice recordings, meeting transcripts, and AI conversations.",
          "Usage data, device information, and platform activity.",
        ],
      },
    ],
  },
  {
    id: "section-3",
    title: "How We Use Your Information",
    content: [
      {
        text: "Your Information is used to deliver and enhance the Noltra.ai experience. We use your data to:",
        bullets: [
          "Provide AI-powered features and automation.",
          "Manage your account and organization workspace.",
          "Improve platform performance and user experience.",
          "Send important service updates and notifications.",
          "Maintain platform security and prevent misuse.",
        ],
      },
    ],
  },
  {
    id: "section-4",
    title: "Data Security",
    content: [
      "We take appropriate technical and organizational measures to protect your information from unauthorized access, disclosure, or misuse. While we strive to maintain a secure environment, no online service can guarantee absolute security.",
    ],
  },
  {
    id: "section-5",
    title: "Data Sharing",
    content: [
      {
        text: "We do not sell your personal or business information. Your data may only be shared when necessary to:",
        bullets: [
          "Deliver integrated services with trusted third-party providers.",
          "Comply with legal obligations or regulatory requirements.",
          "Protect the rights, security, and integrity of Noltra.ai and its users.",
        ],
      },
    ],
  },
  {
    id: "section-6",
    title: "Your Privacy Rights",
    content: [
      {
        text: "You have control over your personal information. Depending on applicable laws, you may have the right to:",
        bullets: [
          "Access your personal data.",
          "Update or correct inaccurate information.",
          "Request deletion of your account or data.",
          "Manage communication and notification preferences.",
        ],
      },
    ],
  },
];

function PrivacyContent() {
  const [activeId, setActiveId] = useState("section-1");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      for (const section of privacySections) {
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
              {privacySections.map((section, index) => {
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
            {privacySections.map((section, sectionIndex) => (
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

export default PrivacyContent;
