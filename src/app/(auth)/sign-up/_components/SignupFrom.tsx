"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";

const fieldClassName =
  "h-11 w-full rounded-[8px] border border-transparent bg-[#f4f6fd] px-4 text-sm text-[#20263a] outline-none transition placeholder:text-[#a6afca] focus:border-[#5f7ff0] focus:bg-white focus:ring-2 focus:ring-[#5f7ff0]/15";

const SignupFrom = () => {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "left");

  const registerMutation = useMutation({
    mutationFn: async () => {
      const email = formData.email.trim();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email,
            password: formData.password,
            acceptTerms,
            rememberMe,
          }),
        }
      );
      const result = (await response.json()) as {
        success?: boolean;
        message?: string | string[];
        data?: { accessToken?: string };
      };
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to create your account");
      }

      const accessToken = result.data?.accessToken;

      if (!accessToken) {
        throw new Error("Access token was not returned. Please try again.");
      }

      return { accessToken, email, message };
    },
    onSuccess: ({ accessToken, email, message }) => {
      localStorage.setItem("accessToken", accessToken);
      toast.success(message || "Account created successfully.");
      router.push(`/email-verification?email=${encodeURIComponent(email)}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    registerMutation.mutate();
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-[1280px] overflow-hidden rounded-[12px]-[18px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <div
          ref={formPanelRef}
          className="flex min-h-[610px] items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-[78px]"
        >
          <div className="w-full max-w-[430px]">
            <div className="mb-7 text-center">
              <Image
                src="/logo.png"
                alt="Noltra.ai"
                width={76}
                height={76}
                priority
                className="mx-auto mb-4 h-auto w-[76px]"
              />
              <h1 className="text-[28px] font-bold leading-tight text-[#111526] sm:text-[32px]">
                Create your account
              </h1>
              <p className="mt-3 text-sm text-[#4f5363]">
                14 days on every plan no credit card.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-base font-normal text-[#8B93B8]">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Enter first name......"
                    value={formData.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-2 block text-base font-normal text-[#8B93B8]">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Enter last name......"
                    value={formData.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-base font-normal text-[#8B93B8]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email address......"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={fieldClassName}
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
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className={`${fieldClassName} pl-10 pr-11`}
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
                    className="h-3.5 w-3.5 rounded-[12px] border-[#b7bfd6] accent-[#5f7ff0]"
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

              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#8994b3]">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="h-3.5 w-3.5 rounded-[12px] border-[#b7bfd6] accent-[#5f7ff0]"
                  required
                />
                I accept the terms and conditions
              </label>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex h-11 w-full items-center justify-center rounded-[12px] bg-[#5f7ff0] px-4 text-sm font-medium text-white transition hover:bg-[#526fdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerMutation.isPending ? "Creating account..." : "Continue"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-[#8994b3]">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#5f7ff0] hover:text-[#4968d9]">
                Sign in
              </Link>
            </p>
          </div>
        </div>

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
      </section>
    </main>
  );
};

export default SignupFrom;
