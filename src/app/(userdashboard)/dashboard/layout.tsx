"use client";

import { Suspense, useState } from "react";
import Header from "../_components/Header";
import { Sidebar } from "../_components/Sideber";

function HeaderFallback() {
  return <div className="fixed left-0 right-0 top-0 z-30 h-[83px] bg-white md:left-[280px]" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <Suspense fallback={<HeaderFallback />}>
        <Header sidebarCollapsed={sidebarCollapsed} />
      </Suspense>
      <main className={`min-h-screen min-w-0 overflow-x-clip pt-[83px] transition-[margin] duration-300 ${sidebarCollapsed ? "md:ml-[88px]" : "md:ml-[280px]"}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
