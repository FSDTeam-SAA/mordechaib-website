"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fields = [
  ["currentPassword", "Current Password", "***************"],
  ["newPassword", "New Password", "Enter Password"],
  ["confirmPassword", "Confirm New Password", "Confirm Password"],
] as const;

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordField = keyof PasswordForm;

type ChangePasswordResponse = {
  success?: boolean;
  message?: string | string[];
};

const emptyForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function getMessage(result: ChangePasswordResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

export function SecurityForm() {
  const { data: session, status: sessionStatus } = useSession();
  const [formValues, setFormValues] = useState<PasswordForm>(emptyForm);
  const [visibleFields, setVisibleFields] = useState<
    Record<PasswordField, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const changePassword = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: Pick<PasswordForm, "currentPassword" | "newPassword">) => {
      const accessToken = session?.user.accessToken;

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as ChangePasswordResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to change password"));
      }

      return result;
    },
    onSuccess: (result) => {
      setFormValues(emptyForm);
      toast.success(getMessage(result, "Password updated successfully."));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to change password"
      );
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formValues.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (formValues.currentPassword === formValues.newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    changePassword.mutate({
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
    });
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Change Password</h2>
      </header>
      <form onSubmit={submit}>
        <div className="space-y-2 p-4">
          {fields.map(([name, label, placeholder]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-base leading-[1.2] text-[#8B93B8]">
                {label}
              </span>
              <div className="relative">
                <Input
                  name={name}
                  type={visibleFields[name] ? "text" : "password"}
                  value={formValues[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete={
                    name === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={name === "currentPassword" ? undefined : 8}
                  required
                  disabled={changePassword.isPending}
                  className="h-[51px] rounded-xl border-0 bg-[#F5F7FF] p-4 pr-12 text-base text-[#0E1224] shadow-none placeholder:text-[#8B93B8] focus-visible:ring-1 focus-visible:ring-[#5B7FF0] md:text-base"
                />
                <button
                  type="button"
                  onClick={() =>
                    setVisibleFields((current) => ({
                      ...current,
                      [name]: !current[name],
                    }))
                  }
                  aria-label={
                    visibleFields[name]
                      ? `Hide ${label.toLowerCase()}`
                      : `Show ${label.toLowerCase()}`
                  }
                  aria-pressed={visibleFields[name]}
                  disabled={changePassword.isPending}
                  className="absolute right-4 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-[#8B93B8] transition hover:text-[#5B7FF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {visibleFields[name] ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </label>
          ))}
        </div>
        <footer className="border-t border-[#E4EAF8] p-4">
          <Button
            type="submit"
            disabled={
              sessionStatus !== "authenticated" || changePassword.isPending
            }
            className="h-[51px] w-full rounded-[12px] bg-[#5B7FF0] px-8 text-sm font-normal text-white shadow-none hover:bg-[#4E6FDE] sm:w-auto"
          >
            {changePassword.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </footer>
      </form>
    </section>
  );
}
