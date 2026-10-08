import PolicyQuestions from "@/components/home/PolicyQuestions";
import TermsContent from "./_components/TermsContent";
import TermsHero from "./_components/TermsHero";
import LegalPageAnimations from "@/components/share/LegalPageAnimations";

function Page() {
  return (
    <main data-legal-page className="min-h-screen bg-white font-sans text-slate-800 antialiased">
      <LegalPageAnimations />
      <TermsHero />
      <TermsContent />
         <PolicyQuestions />
    </main>
  );
}

export default Page;
