export type CalendarMeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "FAILED" | string;

export type CalendarMeeting = {
  id: string;
  sourceType: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  participantEmails: string[];
  status: CalendarMeetingStatus;
  provider?: string;
  eventUrl?: string;
  joinUrl?: string;
};

export type AvailabilityValue = {
  availability: string;
  value: number | null;
  reason?: string;
};

export type CalendarDashboard = {
  asOf: string;
  timezone: string;
  range: { from: string; to: string };
  dataAvailability: { availability: string };
  summary: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    failed: number;
    series: Array<{
      date: string;
      total: number;
      scheduled: number;
      completed: number;
      cancelled: number;
    }>;
  };
  items: CalendarMeeting[];
  upcoming: CalendarMeeting[];
  conflicts: {
    items: Array<{
      type: string;
      meetingIds: string[];
      meetings: string[];
      startsAt: string;
      overlapMinutes?: number;
      requiredBufferMinutes?: number;
    }>;
    travelTime: { availability: string; reason?: string };
  };
  taskAndCalls: {
    tasksCreatedFromCalls: number;
    upcomingDeadlines: number;
    aiReminders: number;
    followUpsPending: AvailabilityValue;
    crmUpdatesToday: AvailabilityValue;
  };
  priority: {
    availability: string;
    classified: number;
    unclassified: number;
    counts: { high: number; medium: number; low: number };
    averageScore: AvailabilityValue;
    confidenceScores: {
      availability: string;
      items: Array<{ meetingId?: string; title?: string; score: number; priority?: string }>;
      reason?: string;
    };
  };
  automation: {
    notesGenerated: number;
    actionItemsCreated: number;
    tasksAssigned: number;
    followUpEmailsSent: AvailabilityValue;
    crmRecordsUpdated: AvailabilityValue;
    customerHealthUpdated: AvailabilityValue;
  };
  aiScheduling: { availability: string; suggestions: unknown[]; reason?: string };
};

export type CalendarFilters = {
  date: Date;
  timezone: string;
  bufferMinutes: number;
  upcomingLimit: number;
  conflictLimit: number;
};
