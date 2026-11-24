import { Loader2, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type WheelEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const quickActions = ["Get today’s briefing", "Schedule a meeting with Iqbal", "Review yesterday’s performance", "Identify top 5 risks this week", "Generate ROI report", "Show me what changed today"] as const;
// const intelligence = ["Churn Prediction", "NPS Analytics", "Customer Health Score", "Renewal Forecasting"] as const;

export type ChiefConversation = {
  _id: string;
  title: string;
  updatedAt?: string;
  preview?: string;
};

type ChiefSidebarProps = {
  conversations: ChiefConversation[];
  activeConversationId: string | null;
  isCreatingConversation: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onLoadMore: () => void;
  onQuickAction: (action: string) => void;
};

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-[#E4EAF8] pb-3.5 text-[0.9375rem]/[1.5rem] font-medium">{children}</h2>;
}

export function ChiefSidebar({ conversations, activeConversationId, isCreatingConversation, isLoadingMore, hasMore, error, onNewChat, onSelectConversation, onDeleteConversation, onLoadMore, onQuickAction }: ChiefSidebarProps) {
  const recentListRef = useRef<HTMLDivElement>(null);
  const activeConversationRef = useRef<HTMLButtonElement>(null);
  const loadRequested = useRef(false);
  const [conversationToDelete, setConversationToDelete] = useState<ChiefConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    activeConversationRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeConversationId]);

  useEffect(() => {
    if (!isLoadingMore) loadRequested.current = false;
  }, [isLoadingMore]);

  function requestMore() {
    if (!hasMore || isLoadingMore || loadRequested.current) return;
    loadRequested.current = true;
    onLoadMore();
  }

  function handleRecentScroll() {
    const list = recentListRef.current;
    if (!list || list.scrollTop + list.clientHeight < list.scrollHeight - 40) return;
    requestMore();
  }

  function handleRecentWheel(event: WheelEvent<HTMLDivElement>) {
    const list = recentListRef.current;
    if (!list) return;

    // Keep wheel/trackpad scrolling inside Recent, even at its top or bottom.
    event.preventDefault();
    event.stopPropagation();
    list.scrollBy({ top: event.deltaY, behavior: "auto" });

    if (event.deltaY > 0 && list.scrollTop + list.clientHeight >= list.scrollHeight - 40) {
      requestMore();
    }
  }

  async function confirmDeleteConversation() {
    if (!conversationToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteConversation(conversationToDelete._id);
      setConversationToDelete(null);
    } catch (deleteConversationError) {
      setDeleteError(
        deleteConversationError instanceof Error
          ? deleteConversationError.message
          : "Unable to delete this conversation.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <aside className="space-y-3">
      <section className="overflow-hidden rounded-lg bg-white p-2.5">
        <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-3.5">
          <h2 className="text-[0.9375rem]/[1.5rem] font-medium">Recent</h2>
          <button type="button" onClick={onNewChat} disabled={isCreatingConversation} className="flex items-center gap-2 rounded-lg bg-[#F5F7FF] p-2 text-sm transition-colors hover:bg-[#E9EDFC] disabled:cursor-not-allowed disabled:opacity-60"><SquarePen className="size-5" strokeWidth={1.6} /> {isCreatingConversation ? "Creating..." : "New Chat"}</button>
        </div>
        <div ref={recentListRef} onScroll={handleRecentScroll} onWheel={handleRecentWheel} className="mt-3.5 h-[260px] w-full min-w-0 space-y-2 overflow-y-auto overscroll-y-contain pr-1 text-sm">
          {conversations.length === 0 ? <p className="px-2.5 py-2 text-xs text-[#8B93B8]">Start a new chat to begin a conversation.</p> : conversations.map((conversation) => {
            const isActive = conversation._id === activeConversationId;
            return (
              <div
                key={conversation._id}
                className={`group flex h-[34px] w-full items-center overflow-hidden rounded-lg transition-colors ${isActive ? "bg-[#F5F7FF]" : "hover:bg-[#F5F7FF]"}`}
              >
                {isActive ? <span className="mr-2.5 h-6 w-1 shrink-0 rounded-r-full bg-[#5B7FF0]" /> : null}
                <button
                  ref={isActive ? activeConversationRef : undefined}
                  type="button"
                  onClick={() => onSelectConversation(conversation._id)}
                  aria-pressed={isActive}
                  className={`min-w-0 flex-1 truncate text-left ${isActive ? "pr-1" : "pl-2.5 pr-1"}`}
                  title={conversation.preview || conversation.title || "New Chat"}
                >
                  {conversation.preview || conversation.title || "New Chat"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setConversationToDelete(conversation);
                  }}
                  aria-label={`Delete conversation: ${conversation.preview || conversation.title || "New Chat"}`}
                  title="Delete conversation"
                  className="mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-md text-[#8B93B8] opacity-0 transition-all hover:bg-white hover:text-[#EF4444] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0] group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
          {hasMore ? <button type="button" onClick={requestMore} disabled={isLoadingMore} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-[#5B7FF0] hover:bg-[#F5F7FF] disabled:cursor-wait"><Loader2 className={`size-3.5 ${isLoadingMore ? "animate-spin" : ""}`} />{isLoadingMore ? "Loading older chats..." : "Load older chats"}</button> : conversations.length > 0 ? <p className="py-2 text-center text-xs text-[#8B93B8]">You&apos;ve reached the beginning.</p> : null}
        </div>
        {error ? <p className="mt-2.5 text-xs text-[#EF4444]">{error}</p> : null}
      </section>
      <section className="rounded-lg bg-white p-2.5">
        <PanelTitle>Quick Actions</PanelTitle>
        <div className="mt-3.5 space-y-2">
          {quickActions.map((action) => <button key={action} type="button" onClick={() => onQuickAction(action)} title={`Use quick action: ${action}`} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-2.5 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B7FF0]">“{action}”</button>)}
        </div>
      </section>
      <Dialog
        open={Boolean(conversationToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setConversationToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent
          showClose={!isDeleting}
          className="max-w-sm rounded-xl border-[#E4EAF8] bg-white p-[1.125rem] text-[#252B48] sm:rounded-xl"
        >
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription className="text-[#667085]">
              This will remove this conversation and its messages from your chat history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="rounded-lg bg-[#FFF1F2] px-2.5 py-2 text-xs text-[#D92D20]" role="alert">
              {deleteError}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:space-x-0">
            <button
              type="button"
              onClick={() => setConversationToDelete(null)}
              disabled={isDeleting}
              style={{ borderRadius: "10px" }}
              className="rounded-lg border border-[#D0D5DD] px-2.5 py-2 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmDeleteConversation()}
              disabled={isDeleting}
              style={{ borderRadius: "10px" }}
              className="rounded-lg bg-[#D92D20] px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete conversation"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <section className="rounded-lg bg-white p-3">
        <PanelTitle>Customer Intelligence</PanelTitle>
        <div className="mt-4 space-y-2">
          {intelligence.map((item) => <button key={item} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC]">{item}</button>)}
        </div>
      </section> */}
    </aside>
  );
}
