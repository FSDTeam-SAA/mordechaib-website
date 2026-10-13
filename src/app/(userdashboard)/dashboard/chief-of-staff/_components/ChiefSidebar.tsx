import { Loader2, SquarePen } from "lucide-react";
import { useEffect, useRef, type WheelEvent } from "react";

const quickActions = ["“Get today’s briefing”", "“Schedule a meeting with Iqbal”", "“Review yesterday’s performance”", "“Identify top 5 risks this week”", "“Discuss team challenges”", "“Generate ROI report “", "“Show me what changed today”"] as const;
const intelligence = ["Churn Prediction", "NPS Analytics", "Customer Health Score", "Renewal Forecasting"] as const;

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
  onLoadMore: () => void;
};

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-[#E4EAF8] pb-4 text-base font-medium">{children}</h2>;
}

export function ChiefSidebar({ conversations, activeConversationId, isCreatingConversation, isLoadingMore, hasMore, error, onNewChat, onSelectConversation, onLoadMore }: ChiefSidebarProps) {
  const recentListRef = useRef<HTMLDivElement>(null);
  const activeConversationRef = useRef<HTMLButtonElement>(null);
  const loadRequested = useRef(false);

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

  return (
    <aside className="space-y-4 py-4 lg:pr-4">
      <section className="overflow-hidden rounded-lg bg-white p-3">
        <div className="flex items-center justify-between border-b border-[#E4EAF8] pb-4">
          <h2 className="text-base font-medium">Recent</h2>
          <button type="button" onClick={onNewChat} disabled={isCreatingConversation} className="flex items-center gap-2 rounded-lg bg-[#F5F7FF] p-2 text-sm transition-colors hover:bg-[#E9EDFC] disabled:cursor-not-allowed disabled:opacity-60"><SquarePen className="size-5" strokeWidth={1.6} /> {isCreatingConversation ? "Creating..." : "New Chat"}</button>
        </div>
        <div ref={recentListRef} onScroll={handleRecentScroll} onWheel={handleRecentWheel} className="mt-4 h-[260px] w-full min-w-0 space-y-2 overflow-y-auto overscroll-y-contain pr-1 text-sm">
          {conversations.length === 0 ? <p className="px-3 py-2 text-xs text-[#8B93B8]">Start a new chat to begin a conversation.</p> : conversations.map((conversation) => {
            const isActive = conversation._id === activeConversationId;
            return <button ref={isActive ? activeConversationRef : undefined} key={conversation._id} type="button" onClick={() => onSelectConversation(conversation._id)} aria-pressed={isActive} className={`flex h-[34px] w-full items-center overflow-hidden rounded-lg pr-3 text-left transition-colors ${isActive ? "bg-[#F5F7FF] before:mr-3 before:h-6 before:w-1 before:shrink-0 before:rounded-r-full before:bg-[#5B7FF0]" : "px-3 hover:bg-[#F5F7FF]"}`}><span className="truncate">{conversation.preview || conversation.title || "New Chat"}</span></button>;
          })}
          {hasMore ? <button type="button" onClick={requestMore} disabled={isLoadingMore} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-[#5B7FF0] hover:bg-[#F5F7FF] disabled:cursor-wait"><Loader2 className={`size-3.5 ${isLoadingMore ? "animate-spin" : ""}`} />{isLoadingMore ? "Loading older chats..." : "Load older chats"}</button> : conversations.length > 0 ? <p className="py-2 text-center text-xs text-[#8B93B8]">You&apos;ve reached the beginning.</p> : null}
        </div>
        {error ? <p className="mt-3 text-xs text-[#EF4444]">{error}</p> : null}
      </section>
      <section className="rounded-lg bg-white p-3">
        <PanelTitle>Quick Actions</PanelTitle>
        <div className="mt-4 space-y-2">
          {quickActions.map((action) => <button key={action} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC]">{action}</button>)}
        </div>
      </section>
      <section className="rounded-lg bg-white p-3">
        <PanelTitle>Customer Intelligence</PanelTitle>
        <div className="mt-4 space-y-2">
          {intelligence.map((item) => <button key={item} className="block min-h-[31px] w-full rounded-lg bg-[#F5F7FF] px-3 py-2 text-left text-xs transition-colors hover:bg-[#E9EDFC]">{item}</button>)}
        </div>
      </section>
    </aside>
  );
}
