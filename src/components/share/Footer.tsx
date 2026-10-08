import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, X, Instagram } from "lucide-react";

const Footer = () => {
  const links = [
    [
      { label: "Home", href: "/" },
      { label: "Features", href: "/#features" },
      { label: "Solutions", href: "/#solutions" },
    ],
    [
      { label: "About", href: "/about-us" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Contact", href: "/#contact" },
    ],
    [
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy & Policy", href: "/privacy-policy" },
    ],
  ];

  return (
    <footer className="bg-[#5d7ff2] px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8">
      <div className="container mx-auto">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.2fr_1.6fr_0.8fr] md:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded bg-white sm:h-[60px] sm:w-[60px]">
                <Image
                  src="/logo.png"
                  alt="Notra.ai"
                  width={1000}
                  height={1000}
                  className="w-full h-full object-contain rounded-[12px]"
                />
              </span>
              <span className="text-sm font-bold">Notra.ai</span>
            </Link>
            <p className="mt-4 max-w-[280px] text-xs leading-relaxed text-white/90">
              The AI Workforce Operating System. Your conversations become execution.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-xs font-medium sm:grid-cols-3 sm:text-sm">
            {links.map((group, index) => (
              <div key={index} className="space-y-5">
                {group.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            {[Linkedin, Instagram, X, Facebook].map((Icon, index) => (
              <Link
                key={index}
                href="#"
                aria-label="Social link"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0f1730]"
              >
                <Icon size={12} />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-4 border-t border-white/35 pt-4 text-[11px] text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Notra Inc. All rights reserved.</p>
          <p>Made with ♥ for small business owners & CEO.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer
