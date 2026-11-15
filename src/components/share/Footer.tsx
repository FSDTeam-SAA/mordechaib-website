import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const socialLinks = [
    {
      label: "Noltra on LinkedIn",
      href: "https://www.linkedin.com/company/noltra/",
      platform: "linkedin",
    },
    {
      label: "Noltra on Facebook",
      href: "https://www.facebook.com/profile.php?id=61587555324582",
      platform: "facebook",
    },
  ];

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
              <span className="text-2xl font-bold">Notra.ai</span>
            </Link>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/90">
              The AI Workforce Operating System. Your conversations become execution.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-base font-medium sm:grid-cols-3">
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
            {socialLinks.map(({ label, href, platform }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105"
              >
                {platform === "facebook" ? (
                  <Image
                    src="/settings/integrations/facebook.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7"
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-7 w-7 fill-[#0A66C2]"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.047c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286h-.002ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                  </svg>
                )}
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
