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
      "Noltra.ai provides an AI-powered business platform at noltra.ai. This Privacy Policy explains what information we collect, how we use, share and keep it, and how you can control it.",
    ],
  },
  {
    id: "section-2",
    title: "Information We Collect",
    content: [
      {
        text: "We collect the following categories of information:",
        bullets: [
          "Account information: your name, email address and contact details.",
          "Workspace information: your organization and workspace details.",
          "Business data you provide or connect: CRM records, contacts and uploaded documents.",
          "Meeting data: meeting details, transcripts, recordings and AI conversations for meetings you connect to Noltra.",
          "Connected accounts: when you connect Zoom, Google Calendar, Outlook, HubSpot or Salesforce, we receive the data described in section 4.",
          "Usage data: device information and activity on the platform.",
        ],
      },
    ],
  },
  {
    id: "section-3",
    title: "How We Use Your Information",
    content: [
      {
        text: "We use your information:",
        bullets: [
          "To provide the platform, including AI features and automation.",
          "To manage your account and workspace.",
          "To improve performance and user experience.",
          "To send important service updates.",
          "To keep the platform secure and prevent misuse.",
        ],
      },
      "We do not use your Zoom data or your meeting content to train AI models, and we do not use it for advertising.",
    ],
  },
  {
    id: "section-4",
    title: "Zoom and Other Connected Accounts",
    content: [
      "When you connect your Zoom account, we receive and store a Zoom access token, your Zoom account ID, your name and email, and details of meetings created through Noltra (meeting ID, topic, time and join link). We use these only to create and show your meetings and to let our meeting assistant join meetings you schedule. We never receive or store your Zoom password. The same purpose limit applies to the Google Calendar, Outlook, HubSpot and Salesforce accounts you choose to connect: we access only the data needed for the features you use.",
    ],
  },
  {
    id: "section-5",
    title: "Meeting Recordings, Transcripts and AI",
    content: [
      "Our meeting assistant can join meetings you schedule through Noltra to capture the transcript. Participants are told that the meeting is being recorded through the notice shown by the meeting platform. Our AI service reads transcripts and suggests actions such as follow-up tasks and follow-up meetings. [A Zoom meeting is created only after you approve it in Noltra.] [We use (AI provider) to process this content on our behalf under terms that protect your data.]",
    ],
  },
  {
    id: "section-6",
    title: "Data Sharing",
    content: [
      {
        text: "We do not sell your personal or business information. We share data only when necessary with:",
        bullets: [
          "The calendar and CRM services you choose to connect (for example Google, Microsoft, HubSpot and Salesforce).",
          "Our meeting assistant provider, which captures meeting audio and transcripts on our behalf.",
          "[Our AI provider, which processes content on our behalf].",
          "Our cloud hosting providers.",
          "Authorities, when required by law or to protect the rights, security and integrity of Noltra and its users.",
        ],
      },
      "These providers may use the data only to provide services to us and must protect it.",
    ],
  },
  {
    id: "section-7",
    title: "Data Security",
    content: [
      "All data in transit is protected with HTTPS (TLS). [Zoom access tokens and other stored credentials are encrypted at rest.] Access to data is limited to people who need it. No online service can guarantee absolute security.",
    ],
  },
  {
    id: "section-8",
    title: "Data Retention and Deletion",
    content: [
      "When you disconnect Zoom, or delete your Noltra account, we delete your Zoom tokens and Zoom data.",
      "We keep a minimal audit record (your name, email, account ID and activity) for [period] to show how the service was used.",
      "Meeting recordings and transcripts are kept for [period] unless you delete them sooner.",
    ],
  },
  {
    id: "section-9",
    title: "Your Privacy Rights and How to Use Them",
    content: [
      "Depending on the law that applies to you, you may access, correct or delete your personal data, and manage your communication preferences. To make a request, email legal@noltra.ai. We respond within [number] days. You can also disconnect Zoom from the integrations page in Noltra, or remove the app in Zoom under Manage, then Added Apps.",
    ],
  },
  {
    id: "section-10",
    title: "Children",
    content: [
      "Noltra is not intended for people under 16, and we do not knowingly collect their data.",
    ],
  },
  {
    id: "section-11",
    title: "Changes to This Policy",
    content: [
      "We may update this policy. We will change the “Last updated” date and notify you of important changes.",
    ],
  },
  {
    id: "section-12",
    title: "Contact",
    content: [
      "Noltra.ai",
      // Add Noltra.ai's registered business address here before publishing it.
      "legal@noltra.ai",
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
            <h2 className="mb-4 text-lg font-semibold text-[#264AFF]">
              Contents
            </h2>
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
                Questions about this policy? Contact us at legal@noltra.ai.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-9 flex items-start gap-3 rounded-[12px] border border-[#F59E0B] bg-[#F59E0B1A] px-4 py-2.5 text-[#F59E0B]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p className="text-[11px] leading-snug sm:text-sm font-normal">
              <span className="font-bold">Summary:</span> Noltra uses your
              information to provide and secure the platform. We do not sell
              your personal or business information, use Zoom data or meeting
              content to train AI models, or use it for advertising.
            </p>
          </div>

          <div className="space-y-9 sm:space-y-10">
            {privacySections.map((section, sectionIndex) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28"
              >
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
