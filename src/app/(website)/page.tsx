import AIAgentSystem from "@/components/home/AIAgentSystem";
// import AddOnsSection from "@/components/home/AddOnsSection";
import ContactMeeting from "@/components/home/ContactMeeting";
import EfficiencyGains from "@/components/home/EfficiencyGains";
import FaqSection from "@/components/home/FaqSection";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import PolicyQuestions from "@/components/home/PolicyQuestions";
import PricingSection from "@/components/home/PricingSection";
import TrustedLeaders from "@/components/home/TrustedLeaders";
import HomeAnimations from "@/components/home/HomeAnimations";

// Keep the public homepage fresh for social-link crawlers. This prevents an
// older Open Graph response from being held by an intermediate cache for a year.
export const revalidate = 3600;

function page() {
  return (
    <main data-home-page>
      <HomeAnimations />
      <Hero />
      {/* <StatsCounter /> */}
      <HowItWorks />
      <AIAgentSystem />
      <EfficiencyGains />
      <PricingSection />
      {/* <AddOnsSection /> */}
      <TrustedLeaders />
      <FaqSection />
      <PolicyQuestions />
      <ContactMeeting />
    </main>
  );
}

export default page;
