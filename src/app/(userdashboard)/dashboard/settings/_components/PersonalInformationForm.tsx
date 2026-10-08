"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const fields = [
  ["firstName", "First name", "Enter first name......", "text", false],
  ["lastName", "Last name", "Enter last name......", "text", false],
  ["email", "Email address", "john@acmecorp.com", "email", true],
  ["phoneNumber", "Phone", "+1 (555) 123-4567", "tel", false],
  ["timezone", "Time zone", "America/New_York", "text", false],
  ["language", "Language", "en", "text", false],
] as const;

type PersonalInformation = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  timezone?: string | null;
  language: string;
  avatarUrl?: string | null;
  profileImage?: string | null;
  avatar?: string | null;
  updatedAt: string;
};

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  timezone: string;
  language: string;
};

type MeResponse = {
  success?: boolean;
  message?: string | string[];
  data?: PersonalInformation;
};

const emptyForm: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  timezone: "",
  language: "",
};

const editableFields = [
  "firstName",
  "lastName",
  "phoneNumber",
  "timezone",
  "language",
] as const;

const fieldClassName =
  "h-[51px] rounded-xl border-0 bg-[#F5F7FF] p-4 text-base text-[#0E1224] shadow-none placeholder:text-[#0E1224] focus-visible:ring-1 focus-visible:ring-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-70 md:text-base";

function getMessage(result: MeResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function toFormValues(profile: PersonalInformation): FormValues {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    timezone: profile.timezone ?? "",
    language: profile.language ?? "",
  };
}

export function PersonalInformationForm() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["auth-me", session?.user.id],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken),
    retry: false,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response.json().catch(() => ({}))) as MeResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load personal information"));
      }

      return result.data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (body: FormData) => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        }
      );
      const result = (await response.json().catch(() => ({}))) as MeResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to update personal information"));
      }

      return result;
    },
    onSuccess: async (result) => {
      if (result.data) {
        queryClient.setQueryData(
          ["auth-me", session?.user.id],
          result.data
        );
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      await queryClient.invalidateQueries({
        queryKey: ["auth-me", session?.user.id],
      });
      toast.success(getMessage(result, "Profile updated successfully."));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update personal information"
      );
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFormValues(toFormValues(profileQuery.data));
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.error) {
      toast.error(
        profileQuery.error instanceof Error
          ? profileQuery.error.message
          : "Unable to load personal information"
      );
    }
  }, [profileQuery.error]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const profile = profileQuery.data;
  const isLoading = sessionStatus === "loading" || profileQuery.isLoading;
  const originalValues = profile ? toFormValues(profile) : emptyForm;
  const hasFieldChanges = editableFields.some(
    (field) => formValues[field] !== originalValues[field]
  );
  const hasChanges = hasFieldChanges || Boolean(avatarFile);
  const currentAvatar =
    profile?.avatarUrl ?? profile?.profileImage ?? profile?.avatar ?? undefined;
  const initials =
    `${formValues.firstName.charAt(0)}${formValues.lastName.charAt(0)}`.toUpperCase() ||
    "U";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be 5 MB or smaller.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile?.updatedAt) {
      toast.error("Profile data is not ready yet. Please try again.");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }

    const body = new FormData();
    body.append("expectedUpdatedAt", profile.updatedAt);

    editableFields.forEach((field) => {
      if (formValues[field] !== originalValues[field]) {
        body.append(field, formValues[field]);
      }
    });

    if (avatarFile) body.append("avatar", avatarFile);
    updateProfile.mutate(body);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <section className="overflow-hidden rounded-lg bg-white">
        <header className="border-b border-[#E4EAF8] p-4">
          <h2 className="text-xl font-medium text-[#0E1224]">Profile Photo</h2>
        </header>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          {isLoading ? (
            <Skeleton className="size-20 shrink-0 rounded-full bg-[#F5F7FF]" />
          ) : (
            <Avatar className="size-20 shrink-0 border border-[#E4EAF8]">
              <AvatarImage
                src={avatarPreview ?? currentAvatar}
                alt={
                  `${formValues.firstName} ${formValues.lastName}`.trim() ||
                  "Profile photo"
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-[#F5F7FF] text-lg font-medium text-[#5B7FF0]">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="avatar"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[12px] bg-[#5B7FF0] px-4 text-sm font-medium text-white transition hover:bg-[#4E6FDE]"
              >
                <Camera className="size-4" />
                Choose photo
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isLoading || updateProfile.isPending}
                className="sr-only"
              />
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  aria-label="Remove selected profile photo"
                  className="flex size-10 items-center justify-center rounded-lg text-[#8B93B8] transition hover:bg-[#F5F7FF] hover:text-[#0E1224]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-2 truncate text-sm text-[#8B93B8]">
              {avatarFile?.name ?? "JPEG, PNG, or WebP. Maximum 5 MB."}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg bg-white">
        <header className="border-b border-[#E4EAF8] p-4">
          <h2 className="text-xl font-medium text-[#0E1224]">
            Personal Information
          </h2>
        </header>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          {fields.map(([name, label, placeholder, type, readOnly]) => (
            <label key={name} className="min-w-0">
              <span className="mb-2 block text-base leading-[1.2] text-[#8B93B8]">
                {label}
              </span>
              {isLoading ? (
                <Skeleton className="h-[51px] w-full rounded-xl bg-[#F5F7FF]" />
              ) : (
                <Input
                  name={name}
                  type={type}
                  value={formValues[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  aria-readonly={readOnly}
                  className={fieldClassName}
                />
              )}
            </label>
          ))}
        </div>
        <footer className="border-t border-[#E4EAF8] p-4">
          <Button
            type="submit"
            disabled={isLoading || updateProfile.isPending || !hasChanges}
            className="h-[51px] w-full rounded-[12px] bg-[#5B7FF0] px-8 text-sm font-normal text-white shadow-none hover:bg-[#4E6FDE] sm:w-auto"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </footer>
      </section>
    </form>
  );
}
