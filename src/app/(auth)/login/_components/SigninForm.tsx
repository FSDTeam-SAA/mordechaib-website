"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";

function SigninForm() {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "right");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const response = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (response?.error || !response?.ok) {
        throw new Error(response?.error || "Login failed");
      }

      toast.success("Login successful!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message === "CredentialsSignin" ? "Invalid email or password" : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-[1280px] overflow-hidden rounded-[18px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <div
          ref={imagePanelRef}
          className="relative hidden min-h-[610px] overflow-hidden bg-[#6080f2] md:block"
        >
          <Image
            src="/auth.png"
            alt="Noltra AI product benefits"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            className="object-cover"
          />
        </div>

        <div
          ref={formPanelRef}
          className="flex min-h-[610px] items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-[78px]"
        >
          <div className="w-full max-w-[430px]">
            <div className="mb-9 text-center">
              <Image
                src="/logo.png"
                alt="Noltra.ai"
                width={76}
                height={76}
                priority
                className="mx-auto mb-5 h-auto w-[76px]"
              />
              <h1 className="text-[30px] font-bold leading-tight text-[#111526] sm:text-[34px]">
                Welcome back
              </h1>
              <p className="mt-3 text-sm text-[#4f5363]">
                Sign in to your Noltra workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-base font-normal text-[#8B93B8]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter full name......"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, email: event.target.value }))
                  }
                  className="h-11 w-full rounded-[8px] border border-transparent bg-[#f4f6fd] px-4 text-sm text-[#20263a] outline-none transition placeholder:text-[#a6afca] focus:border-[#5f7ff0] focus:bg-white focus:ring-2 focus:ring-[#5f7ff0]/15"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-base font-normal text-[#8B93B8]">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ba7ca]"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, password: event.target.value }))
                    }
                    className="h-11 w-full rounded-[8px] border border-transparent bg-[#f4f6fd] pl-10 pr-11 text-sm text-[#20263a] outline-none transition placeholder:text-[#a6afca] focus:border-[#5f7ff0] focus:bg-white focus:ring-2 focus:ring-[#5f7ff0]/15"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ba7ca] transition hover:text-[#5f7ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#8994b3]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#b7bfd6] accent-[#5f7ff0]"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgotpassword"
                  className="text-xs font-medium text-[#5f7ff0] transition hover:text-[#4968d9]"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center rounded-[12px] bg-[#5f7ff0] px-4 text-sm font-medium text-white transition hover:bg-[#526fdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign in to Noltra"}
              </button>
            </form>

            <p className="mt-9 text-center text-xs text-[#8994b3]">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-[#5f7ff0] transition hover:text-[#4968d9]"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SigninForm;
