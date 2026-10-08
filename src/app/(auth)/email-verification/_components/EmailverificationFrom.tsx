"use client";

import { ClipboardEvent, FormEvent, KeyboardEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";

const emptyCode = ["", "", "", "", "", ""];

type VerifyEmailFormProps = {
  email?: string;
};

type VerifyEmailResponse = {
  success: boolean;
  message?: string | string[];
};

function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(emptyCode);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "left");

  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );
      const result = (await response.json()) as VerifyEmailResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Email verification failed");
      }

      return message;
    },
    onSuccess: (message) => {
      toast.success(message || "Email verified successfully.");
      router.push("/entity");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Email verification failed. Please try again."
      );
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailAddress }),
        }
      );
      const result = (await response.json()) as VerifyEmailResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to resend verification code");
      }

      return message;
    },
    onSuccess: (message) => {
      setOtp([...emptyCode]);
      inputRefs.current[0]?.focus();
      toast.success(message || "Verification code sent successfully.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to resend verification code. Please try again."
      );
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;

    const nextOtp = [...emptyCode];
    digits.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email address is missing. Please request a new code.");
      return;
    }

    resendCodeMutation.mutate(email);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email address is missing. Please request a new code.");
      return;
    }

    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    verifyEmailMutation.mutate(code);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid w-full max-w-[1280px] overflow-hidden rounded-[18px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <div
          ref={formPanelRef}
          className="flex min-h-[610px] items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-[78px]"
        >
          <div className="w-full max-w-[390px]">
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-[#111526] transition hover:text-[#5f7ff0]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to sign in
            </Link>

            <div className="mb-7 text-center">
              <Image
                src="/logo.png"
                alt="Noltra.ai"
                width={76}
                height={76}
                priority
                className="mx-auto mb-5 h-auto w-[76px]"
              />
              <h1 className="text-[30px] font-bold leading-tight text-[#111526] sm:text-[34px]">
                Verify your email
              </h1>
              <p className="mt-3 text-sm text-[#4f5363]">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-[#111526]">
                  {email || "your email address"}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-2.5 sm:gap-3" role="group" aria-label="Verification code">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${index + 1}`}
                    className="aspect-square w-full min-w-0 rounded-[12px] border border-transparent bg-[#f4f6fd] text-center text-base font-medium text-[#5f7ff0] outline-none transition focus:border-[#5f7ff0] focus:bg-white focus:ring-2 focus:ring-[#5f7ff0]/15"
                    required
                  />
                ))}
              </div>

              <div className="mt-4 text-center text-xs text-[#8B93B8]">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    resendCodeMutation.isPending || verifyEmailMutation.isPending
                  }
                  className="font-semibold text-[#111526] transition hover:text-[#5f7ff0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendCodeMutation.isPending ? "Resending..." : "Resend code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  otp.some((digit) => !digit) || verifyEmailMutation.isPending
                }
                className="mt-8 flex h-11 w-full items-center justify-center rounded-[12px] bg-[#5f7ff0] px-4 text-sm font-medium text-white transition hover:bg-[#526fdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyEmailMutation.isPending ? "Verifying..." : "Verify email"}
              </button>
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

export default VerifyEmailForm;
