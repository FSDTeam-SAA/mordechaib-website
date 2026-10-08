"use client";

import { useRouter } from "next/navigation";
import { AddTaskForm } from "./_components/AddTaskForm";

export default function AddTaskPage() {
  const router = useRouter();
  return <div className="min-h-screen "><AddTaskForm onCancel={() => router.push("/dashboard/tasks")} /></div>;
}
