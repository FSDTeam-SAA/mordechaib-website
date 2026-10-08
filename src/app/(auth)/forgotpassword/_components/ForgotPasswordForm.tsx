"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";

function ForgotPasswordForm() {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "left");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        }
      );
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send verification code");
      }

      toast.success(result.message || "Verification code sent to your email.");
      router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send verification code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-[1280px] overflow-hidden rounded-[18px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <div
          ref={formPanelRef}
          className="flex min-h-[560px] items-center justify-center px-6 py-10 sm:px-12 md:min-h-[610px] lg:px-16 xl:px-[78px]"
        >
          <div className="w-full max-w-[430px]">
            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[#111526] transition hover:text-[#5f7ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to sign in
            </Link>

            <div className="mb-8 text-center">
              <Image
                src="/logo.png"
                alt="Noltra.ai"
                width={76}
                height={76}
                priority
                className="mx-auto mb-5 h-auto w-[76px]"
              />
              <h1 className="text-[30px] font-bold leading-tight text-[#111526] sm:text-[34px]">
                Forgot Password?
              </h1>
              <p className="mx-auto mt-3 max-w-[400px] text-sm leading-5 text-[#4f5363]">
                If you need help resetting your password, we can help by sending
                you a link to reset it.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                className="mb-2 block text-base font-normal text-[#8B93B8]"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email......"
                required
                className="h-11 border-transparent bg-[#f4f6fd] px-4 text-sm text-[#20263a] rounded-[12px] shadow-none placeholder:text-[#a6afca] focus-visible:border-[#5f7ff0] focus-visible:bg-white focus-visible:ring-[#5f7ff0]/20"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-9 h-11 w-full bg-[#5f7ff0] text-sm font-medium text-white rounded-[12px] hover:bg-[#526fdb] focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2"
              >
                {isLoading ? "Sending..." : "Continue"}
              </Button>
            </form>
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
}

export default ForgotPasswordForm;
