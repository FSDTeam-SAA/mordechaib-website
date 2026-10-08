"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";

function ChangePasswordForm() {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "left");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const resetToken = localStorage.getItem("resetToken");

    if (!resetToken) {
      toast.error("Reset session is missing. Please verify your email again.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-password-reset-token": resetToken,
          },
          body: JSON.stringify({ newPassword }),
        }
      );
      const result = (await response.json()) as {
        success?: boolean;
        message?: string | string[];
      };
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Password reset failed");
      }

      localStorage.removeItem("resetToken");
      toast.success(message || "Password changed successfully");
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password reset failed";
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
          className="flex min-h-[610px] items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-[78px]"
        >
          <div className="w-full max-w-[390px]">
            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-[#111526] transition hover:text-[#5f7ff0]"
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
                Reset Password?
              </h1>
              <p className="mx-auto mt-3 max-w-[360px] text-sm leading-5 text-[#4f5363]">
                Please enter a new password for your account. Use a strong password to keep your
                account secure.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordField
                id="newPassword"
                label="New Password"
                value={newPassword}
                visible={showNewPassword}
                onChange={setNewPassword}
                onToggle={() => setShowNewPassword((current) => !current)}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                visible={showConfirmPassword}
                onChange={setConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-7 flex h-11 w-full items-center justify-center rounded-[12px] bg-[#5f7ff0] px-4 text-sm font-medium text-white transition hover:bg-[#526fdb] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2"
              >
                {isLoading ? "Changing..." : "Change Password"}
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

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function PasswordField({
  id,
  label,
  value,
  visible,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-normal text-[#8B93B8]">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ba7ca]"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Min. 8 characters"
          className="h-11 w-full rounded-[12px] border border-transparent bg-[#f4f6fd] pl-10 pr-11 text-sm text-[#20263a] outline-none transition placeholder:text-[#a6afca] focus:border-[#5f7ff0] focus:bg-white focus:ring-2 focus:ring-[#5f7ff0]/15"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ba7ca] transition hover:text-[#5f7ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0]"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordForm;
