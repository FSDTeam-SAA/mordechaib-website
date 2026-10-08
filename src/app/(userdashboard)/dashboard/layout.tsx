import { Suspense } from "react";
import Header from "../_components/Header";
import { Sidebar } from "../_components/Sideber";

function HeaderFallback() {
  return <div className="fixed left-0 right-0 top-0 z-30 h-[83px] bg-white md:left-[260px]" />;
}

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <Sidebar />
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main className="min-h-screen pt-[83px] md:ml-[260px]">{children}</main>
    </div>
  );
}

export default layout;
