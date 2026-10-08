"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about-us" },
  { label: "Faq", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Account";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 8);

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  useEffect(() => {
    const closeProfile = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  const logout = async () => {
    setProfileOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-3 transition-[padding] duration-300 ease-out sm:px-6 lg:px-8 ${
        isScrolled ? "pt-0" : "pt-3 sm:pt-6"
      }`}
    >
      <nav
        className={`container mx-auto flex h-14 items-center justify-between bg-[#F5F7FF] px-2.5 shadow-sm backdrop-blur transition-[border-radius,box-shadow] duration-300 sm:h-16 sm:px-4 lg:h-[72px] lg:px-4 xl:h-[84px] xl:px-5 ${
          isScrolled ? "rounded-b-md shadow-md" : "rounded-[12px] shadow-sm"
        }`}
      >
        <Link href="/" className="flex items-center">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-white shadow-sm sm:h-12 sm:w-12 lg:h-[52px] lg:w-[52px] xl:h-[60px] xl:w-[60px]">
            <Image
              src="/logo.png"
              alt="Notra.ai"
              width={1000}
              height={1000}
              className="h-full w-full object-contain object-left"
              priority
            />
          </span>
        </Link>

        <div className="hidden items-center font-medium text-[#0E1224] lg:flex lg:gap-3 lg:text-sm xl:gap-7 xl:text-xl">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-[#5B7FF0]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center lg:flex lg:gap-2 xl:gap-3">
          {status === "authenticated" ? <div ref={profileRef} className="relative">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-2 rounded-[12px] border border-[#D9E0FF] bg-white p-1.5 pr-3 text-left transition hover:bg-[#EEF3FF]">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#5B7FF0] text-xs font-bold text-white">{initials}</span>
              <span className="max-w-28 truncate text-sm font-medium text-[#0E1224]">{displayName}</span>
            </button>
            {profileOpen && <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-[#E2E7F5] bg-white p-2 shadow-xl">
              <div className="border-b border-[#EEF1F8] px-3 py-2"><p className="truncate text-sm font-semibold text-[#0E1224]">{displayName}</p><p className="mt-0.5 truncate text-xs text-[#7A849D]">{user?.email}</p></div>
              <Link role="menuitem" href="/dashboard" onClick={() => setProfileOpen(false)} className="mt-1 flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-[#30384F] hover:bg-[#F5F7FF]"><LayoutDashboard className="size-4" />Dashboard</Link>
              <Link role="menuitem" href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-[#30384F] hover:bg-[#F5F7FF]"><Settings className="size-4" />Settings</Link>
              <button type="button" role="menuitem" onClick={() => void logout()} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-[#E5484D] hover:bg-red-50"><LogOut className="size-4" />Log out</button>
            </div>}
          </div> : <Link href="/login" className="rounded-[12px] border border-[#5B7FF0] font-medium text-[#5B7FF0] transition-colors hover:bg-[#5B7FF0] hover:text-white lg:px-4 lg:py-2 lg:text-sm xl:px-8 xl:py-3 xl:text-base">Sign In</Link>}
          <Link
            href="#trial"
            className="rounded-[12px] bg-[#5B7FF0] font-semibold text-white shadow-sm transition-colors hover:bg-[#5B7FF0]/90 lg:px-4 lg:py-2 lg:text-sm xl:px-6 xl:py-3 xl:text-base"
          >
            Start Free Trial
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D9E0FF] bg-white text-[#10152B] shadow-sm transition-colors hover:bg-[#EEF2FF] lg:hidden"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="flex w-[88%] max-w-[360px] flex-col border-l border-[#E4E8F7] bg-white p-0"
          >
            <SheetHeader className="border-b border-[#E8EBF5] bg-[#F5F7FF] px-5 py-4 text-left">
              <SheetTitle>
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Notra.ai"
                    width={56}
                    height={56}
                    className="h-12 w-12 object-contain"
                  />
                </Link>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-1 flex-col px-5 py-6">
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center justify-between border-b border-[#EEF0F7] text-base font-medium text-[#0E1224] transition-colors hover:text-[#5B7FF0]"
                    >
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-[#9AA4C4]" />
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="mt-auto grid gap-3 pt-8">
                {status === "authenticated" ? <>
                  <SheetClose asChild><Link href="/dashboard" className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#5B7FF0] text-sm font-semibold text-[#5B7FF0]"><LayoutDashboard className="size-4" />Dashboard</Link></SheetClose>
                  <button type="button" onClick={() => void logout()} className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-red-200 text-sm font-semibold text-[#E5484D]"><LogOut className="size-4" />Log out</button>
                </> : <SheetClose asChild><Link href="/login" className="inline-flex h-12 items-center justify-center rounded-[12px] border border-[#5B7FF0] text-sm font-semibold text-[#5B7FF0]">Sign In</Link></SheetClose>}
                <SheetClose asChild>
                  <Link
                    href="#trial"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] text-sm font-semibold text-white shadow-sm"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Navbar;
