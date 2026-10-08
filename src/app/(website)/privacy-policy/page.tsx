import PolicyQuestions from "@/components/home/PolicyQuestions";
import PrivacyContent from "./_components/PrivacyContent";
import PrivacyHero from "./_components/PrivacyHero";
import LegalPageAnimations from "@/components/share/LegalPageAnimations";

function Page() {
  return (
    <main data-legal-page className="min-h-screen bg-white font-sans text-slate-800 antialiased">
      <LegalPageAnimations />
      <PrivacyHero />
      <PrivacyContent />
       <PolicyQuestions />
    </main>
  );
}

export default Page;
