import { Suspense } from "react";
import { ChiefOfStaffDashboard } from "./_components/ChiefOfStaffDashboard";

export default function ChiefOfStaffPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[calc(100vh-83px)] bg-[#F5F7FF]" />}
    >
      <ChiefOfStaffDashboard />
    </Suspense>
  );
}
