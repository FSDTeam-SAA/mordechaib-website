"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  AddTaskForm,
  type EditableTask,
} from "../../add-task/_components/AddTaskForm";

type TaskResponse = {
  success?: boolean;
  message?: string | string[];
  data?: EditableTask;
};

function getMessage(result: TaskResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user.accessToken;
  const taskId = decodeURIComponent(params.id);

  const taskQuery = useQuery({
    queryKey: ["task-details", taskId],
    enabled:
      sessionStatus === "authenticated" &&
      Boolean(accessToken) &&
      Boolean(taskId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tasks/${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response.json().catch(() => ({}))) as TaskResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load task."));
      }

      return result.data;
    },
  });

  const goToTasks = () => router.push("/dashboard/tasks");

  if (sessionStatus === "loading" || taskQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white p-6">
        <div className="text-center text-[#8B93B8]">
          <LoaderCircle className="mx-auto size-8 animate-spin text-[#5B7FF0]" />
          <p className="mt-3 text-sm">Loading task...</p>
        </div>
      </div>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E4EAF8] p-6 text-center">
          <CircleAlert className="mx-auto size-9 text-[#EF4444]" />
          <h1 className="mt-3 text-xl font-medium text-[#0E1224]">
            Unable to load task
          </h1>
          <p className="mt-2 text-sm text-[#8B93B8]">
            {taskQuery.error instanceof Error
              ? taskQuery.error.message
              : "Please try again."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" variant="outline" onClick={goToTasks}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => void taskQuery.refetch()}
              className="bg-[#5B7FF0] text-white hover:bg-[#4E6FDE]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AddTaskForm
        taskId={taskId}
        initialTask={taskQuery.data}
        onCancel={goToTasks}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["tasks"] });
          void queryClient.invalidateQueries({ queryKey: ["task-details"] });
          void queryClient.invalidateQueries({
            queryKey: ["organizer-dashboard", "task-overview"],
          });
          goToTasks();
        }}
      />
    </div>
  );
}
