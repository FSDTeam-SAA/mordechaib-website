
import Footer from "@/components/share/Footer";
import Navbar from "@/components/share/Navbar";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="">
        <Navbar />
        <div className="bg-[#FFFFFF]">{children}</div>
        <Footer />
      </div>
    </>
  );
}

export default layout;
