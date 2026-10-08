"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CompanyDetailsStep } from "./_components/CompanyDetailsStep";
import { CompleteStep } from "./_components/CompleteStep";
import { IndustryStep } from "./_components/IndustryStep";
import { ProfileProgress } from "./_components/ProfileProgress";
import { TeamSizeStep } from "./_components/TeamSizeStep";
import type { ProfileFormData } from "./_components/types";

const initialData: ProfileFormData = {
  companyName: "",
  website: "",
  phoneNumber: "",
  businessHoursStart: "",
  businessHoursEnd: "",
  city: "",
  street: "",
  state: "",
  postalCode: "",
  industry: "",
  businessSize: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const update = (data: Partial<ProfileFormData>) => setFormData((current) => ({ ...current, ...data }));
  const next = () => setStep((current) => Math.min(current + 1, 4));
  const back = () => setStep((current) => Math.max(current - 1, 1));

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const body = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        const normalizedValue = value.trim();
        if (normalizedValue) body.append(key, normalizedValue);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizations/me`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        }
      );
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
      };
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || result.success === false) {
        throw new Error(message || "Unable to update your business profile");
      }

      return message;
    },
    onSuccess: (message) => {
      toast.success(message || "Business profile updated successfully.");
      next();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your business profile. Please try again."
      );
    },
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fffaff_0%,#f6f8ff_55%,#eef2ff_100%)] px-4 py-8 text-[#101427] sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <ProfileProgress currentStep={step} />
        <div className="mx-auto mt-8 max-w-5xl sm:mt-11">
          {step === 1 && <CompanyDetailsStep data={formData} onChange={update} onNext={next} />}
          {step === 2 && <IndustryStep value={formData.industry} onChange={(industry) => update({ industry })} onBack={back} onNext={next} />}
          {step === 3 && <TeamSizeStep value={formData.businessSize} onChange={(businessSize) => update({ businessSize })} onBack={back} onNext={() => updateOrganizationMutation.mutate(formData)} isSubmitting={updateOrganizationMutation.isPending} />}
          {step === 4 && <CompleteStep onBack={back} onComplete={() => {
            toast.success("Your business profile is ready.");
            router.push("/login");
          }} />}
        </div>
      </div>
    </main>
  );
}
