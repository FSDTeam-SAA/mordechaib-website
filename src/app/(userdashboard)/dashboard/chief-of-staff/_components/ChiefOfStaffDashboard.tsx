"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AgentStatusBar } from "./AgentStatusBar";
import { ChiefNavigation, ChiefTab } from "./ChiefNavigation";
import { ChiefConversation, ChiefSidebar } from "./ChiefSidebar";
import { ExecutiveBriefings } from "./ExecutiveBriefings";
import { LauraConversation } from "./LauraConversation";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string | string[] };
type ConversationList = { items: ChiefConversation[]; pagination: { page: number; pages: number } };
type MessagePreviewPayload = { items: Array<{ content?: string | null }> };

function apiError(result: ApiEnvelope<unknown>, fallback: string) {
  const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
  return message || fallback;
}

export function ChiefOfStaffDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<ChiefTab>(
    searchParams.get("tab") === "executive" ? "executive" : "ask",
  );
  const [conversations, setConversations] = useState<ChiefConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const accessToken = session?.user.accessToken;

  const loadConversations = useCallback(async (page = 1, append = false) => {
    if (!accessToken) return;
    if (append) setIsLoadingMoreConversations(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages/conversations?page=${page}&limit=5`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const result = (await response.json().catch(() => ({}))) as ApiEnvelope<ConversationList>;
    if (!response.ok || !result.success || !result.data) throw new Error(apiError(result, "Unable to load your conversations."));
    const conversationsWithPreviews = await Promise.all(result.data.items.map(async (conversation) => {
      try {
        const query = new URLSearchParams({ conversationId: conversation._id, page: "1", limit: "1" });
        const previewResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages?${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const previewResult = (await previewResponse.json().catch(() => ({}))) as ApiEnvelope<MessagePreviewPayload>;
        const preview = previewResult.data?.items[0]?.content?.replace(/\s+/g, " ").trim();
        return preview ? { ...conversation, preview } : conversation;
      } catch {
        return conversation;
      }
    }));
    setConversations((current) => append
      ? [...current, ...conversationsWithPreviews.filter((conversation) => !current.some((item) => item._id === conversation._id))]
      : conversationsWithPreviews,
    );
    setConversationPage(result.data.pagination.page);
    setHasMoreConversations(result.data.pagination.page < result.data.pagination.pages);
    if (append) setIsLoadingMoreConversations(false);
  }, [accessToken]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    void loadConversations().catch((error) => setConversationError(error instanceof Error ? error.message : "Unable to load your conversations."));
  }, [accessToken, loadConversations, sessionStatus]);

  function changeTab(tab: ChiefTab) {
    setActiveTab(tab);
    router.replace(
      tab === "executive"
        ? "/dashboard/chief-of-staff?tab=executive"
        : "/dashboard/chief-of-staff",
      { scroll: false },
    );
  }

  async function createNewChat(): Promise<string | null> {
    if (!accessToken) {
      setConversationError("Your session is missing. Please sign in again.");
      return null;
    }
    setIsCreatingConversation(true);
    setConversationError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<ChiefConversation>;
      if (!response.ok || !result.success || !result.data?._id) throw new Error(apiError(result, "Unable to create a new chat."));
      setConversations((current) => [result.data!, ...current.filter((conversation) => conversation._id !== result.data!._id)].slice(0, 5));
      setActiveConversationId(result.data._id);
      void loadConversations();
      return result.data._id;
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "Unable to create a new chat.");
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }

  const handleConversationUpdated = useCallback((conversationId: string, preview: string, moveToTop = false) => {
    setConversations((current) => {
      const conversation = current.find((item) => item._id === conversationId);
      if (!conversation) return current;
      const updatedConversation = { ...conversation, preview };
      return moveToTop
        ? [updatedConversation, ...current.filter((item) => item._id !== conversationId)]
        : current.map((item) => item._id === conversationId ? updatedConversation : item);
    });
    if (moveToTop) void loadConversations();
  }, [loadConversations]);

  const loadMoreConversations = useCallback(() => {
    if (isLoadingMoreConversations || !hasMoreConversations) return;
    void loadConversations(conversationPage + 1, true).catch((error) => {
      setConversationError(error instanceof Error ? error.message : "Unable to load more conversations.");
      setIsLoadingMoreConversations(false);
    });
  }, [conversationPage, hasMoreConversations, isLoadingMoreConversations, loadConversations]);

  return (
    <main className="min-h-[calc(100vh-83px)] bg-[#F5F7FF] p-3 text-[#0E1224] sm:p-4">
      <ChiefNavigation activeTab={activeTab} onTabChange={changeTab} />
      {activeTab === "ask" ? (
        <>
          <AgentStatusBar />
          <div className="mt-3 grid items-start gap-3 lg:grid-cols-[348px_minmax(0,1fr)]">
            <ChiefSidebar conversations={conversations} activeConversationId={activeConversationId} isCreatingConversation={isCreatingConversation} isLoadingMore={isLoadingMoreConversations} hasMore={hasMoreConversations} error={conversationError} onNewChat={() => void createNewChat()} onSelectConversation={setActiveConversationId} onLoadMore={loadMoreConversations} />
            <LauraConversation conversationId={activeConversationId} accessToken={accessToken} sessionStatus={sessionStatus} onConversationUpdated={handleConversationUpdated} onStartConversation={createNewChat} />
          </div>
        </>
      ) : (
        <ExecutiveBriefings />
      )}
    </main>
  );
}
