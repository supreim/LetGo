"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type BringUpMethod =
  | "shadow-work"
  | "worst-case"
  | "memory"
  | "open-awareness";

type ReliefFilter = "all" | "relief" | "no-relief";

type ConsciousnessLevel =
  | "shame"
  | "guilt"
  | "apathy"
  | "grief"
  | "fear"
  | "desire"
  | "anger"
  | "pride"
  | "courage"
  | "acceptance"
  | "love";

type LetGoSession = {
  id: string;
  feelingLabel: string;
  prepNote: string;
  method: BringUpMethod;
  methodItems: string[];
  issues: string[];
  triggers: string[];
  gains: string[];
  consciousnessLevel: ConsciousnessLevel | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  allowingRating: number;
  relief: boolean;
  closingNote: string;
};

type ActiveSession = {
  id: string;
  feelingLabel: string;
  prepNote: string;
  method: BringUpMethod;
  methodItems: string[];
  startedAtMs: number;
};

type StartFormState = {
  feelingLabel: string;
  prepNote: string;
  method: BringUpMethod;
  methodItems: string[];
};

type SessionDraft = {
  id: string;
  feelingLabel: string;
  prepNote: string;
  method: BringUpMethod;
  methodItems: string[];
  issues: string[];
  triggers: string[];
  gains: string[];
  consciousnessLevel: ConsciousnessLevel | null;
  startedAtLocal: string;
  durationMinutes: string;
  allowingRating: number;
  relief: boolean;
  closingNote: string;
};

type JournalAllowance = "yes" | "partly" | "no";

type JournalEntry = {
  id: string;
  dayKey: string;
  daySummary: string;
  feelingThatPoppedUp: string;
  allowance: JournalAllowance;
  differentChoice: string;
  recognizedPatterns: string;
  whatHappened: string;
  whatWantedToHappen: string;
  differenceFeeling: string;
  startOfDayFeeling: string;
  endOfDayFeeling: string;
  createdAt: string;
  updatedAt: string;
};

type JournalDraft = {
  id: string;
  dayKey: string;
  daySummary: string;
  feelingThatPoppedUp: string;
  allowance: JournalAllowance;
  differentChoice: string;
  recognizedPatterns: string;
  whatHappened: string;
  whatWantedToHappen: string;
  differenceFeeling: string;
  startOfDayFeeling: string;
  endOfDayFeeling: string;
  createdAt: string;
};

type JournalStepId =
  | "dayKey"
  | "feelingThatPoppedUp"
  | "daySummary"
  | "allowance"
  | "differentChoice"
  | "recognizedPatterns"
  | "whatHappened"
  | "whatWantedToHappen"
  | "differenceFeeling"
  | "startOfDayFeeling"
  | "endOfDayFeeling";

type JournalStepKind = "date" | "input" | "textarea" | "allowance";

type JournalStepConfig = {
  id: JournalStepId;
  kind: JournalStepKind;
  label: string;
  helper: string;
  placeholder?: string;
};

type MethodConfig = {
  id: BringUpMethod;
  label: string;
  shortLabel: string;
  description: string;
  setupLabel: string;
  guidance: string;
  support: string;
  itemLabel: string;
  itemHint: string;
  itemPlaceholder: string;
  addItemLabel: string;
};

type LevelConfig = {
  id: ConsciousnessLevel;
  label: string;
};

type CountEntry = {
  label: string;
  count: number;
};

type ThemeMode = "light" | "dark";

type TrackerBoard = {
  currentLevel: ConsciousnessLevel | null;
  issues: string[];
  triggers: string[];
  gains: string[];
};

type AppView =
  | "all"
  | "let-go"
  | "start-session"
  | "analytics"
  | "calendar"
  | "trackers"
  | "journal"
  | "history";

type GraphMetricId = "sessions" | "minutes" | "allowing" | "relief";

type TrendPoint = {
  dayKey: string;
  label: string;
  sessions: number;
  minutes: number;
  allowing: number;
  relief: number;
};

type GraphMetricConfig = {
  id: GraphMetricId;
  label: string;
  description: string;
  color: string;
  formatValue: (value: number) => string;
};

type DataTransferNotice = {
  tone: "success" | "error";
  message: string;
};

type ExportPayload = {
  version: 1;
  exportedAt: string;
  sessions: LetGoSession[];
  journalEntries: JournalEntry[];
  trackers: TrackerBoard;
  themeMode: ThemeMode;
};

type ImportPayload = {
  sessions: LetGoSession[];
  journalEntries: JournalEntry[];
  trackers: TrackerBoard;
  themeMode: ThemeMode | null;
};

const STORAGE_KEY = "letgo.sessions.v1";
const JOURNAL_STORAGE_KEY = "letgo.journal.v1";
const TRACKERS_STORAGE_KEY = "letgo.trackers.v1";
const THEME_STORAGE_KEY = "letgo.theme.v1";

const METHODS: MethodConfig[] = [
  {
    id: "shadow-work",
    label: "Shadow work",
    shortLabel: "Shadow",
    description: "Name the hidden, disowned, or judged part that the sensation seems tied to.",
    setupLabel: "What part of you wants room right now?",
    guidance:
      "Let the uncomfortable part come close without defending yourself against it.",
    support:
      "Move from the story about the part into the body sensation that comes with it.",
    itemLabel: "Shadow items",
    itemHint: "Write each trait, role, fear, truth, or disowned part as its own line.",
    itemPlaceholder: "A part of me I do not want to admit is...",
    addItemLabel: "Add shadow item",
  },
  {
    id: "worst-case",
    label: "Picture the worst case",
    shortLabel: "Worst case",
    description:
      "Deliberately picture the feared outcome so the sensation becomes easier to meet directly.",
    setupLabel: "What feared outcome are you letting yourself picture?",
    guidance:
      "Let the scenario activate the feeling, then stop escalating the story and stay with the body.",
    support:
      "The goal is not to solve the scenario. It is to allow the sensation it triggers.",
    itemLabel: "Worst-case images",
    itemHint: "Write each feared scenario or consequence as its own line.",
    itemPlaceholder: "The thing I am afraid could happen is...",
    addItemLabel: "Add feared outcome",
  },
  {
    id: "memory",
    label: "Return to a memory",
    shortLabel: "Memory",
    description:
      "Recall an earlier moment with the same sensation and let the body remember it.",
    setupLabel: "Which earlier moment carries this same sensation?",
    guidance:
      "Touch the memory enough to wake up the feeling, then shift attention from the scene to the body.",
    support:
      "You do not need the whole story. A fragment, age, or image is enough.",
    itemLabel: "Memory fragments",
    itemHint: "Write each moment, image, age, or scene fragment on its own line.",
    itemPlaceholder: "A memory fragment that carries this feeling is...",
    addItemLabel: "Add memory fragment",
  },
  {
    id: "open-awareness",
    label: "Do nothing",
    shortLabel: "Do nothing",
    description:
      "Skip the setup and notice what thoughts or sensations are already present.",
    setupLabel: "What sensation is already here without effort?",
    guidance:
      "Drop the search. Notice the thought that appears and the body response that follows it.",
    support:
      "Stay close to the raw sensation, while also noting the thoughts that set it off.",
    itemLabel: "Triggering thoughts",
    itemHint: "Write the thoughts that popped up and caused or intensified the sensation.",
    itemPlaceholder: "The thought that popped up was...",
    addItemLabel: "Add triggering thought",
  },
];

const LEVELS: LevelConfig[] = [
  { id: "shame", label: "Shame" },
  { id: "guilt", label: "Guilt" },
  { id: "apathy", label: "Apathy" },
  { id: "grief", label: "Grief" },
  { id: "fear", label: "Fear" },
  { id: "anger", label: "Anger" },
  { id: "desire", label: "Desire" },
  { id: "pride", label: "Pride" },
  { id: "courage", label: "Courage" },
  { id: "acceptance", label: "Acceptance" },
  { id: "love", label: "Love" },
];

const RATING_OPTIONS = [
  {
    value: 1,
    label: "Braced",
    description: "I mostly fought, escaped, or armored against it.",
  },
  {
    value: 2,
    label: "Wobbly",
    description: "I touched it, but kept pulling away from it.",
  },
  {
    value: 3,
    label: "Mixed",
    description: "I allowed some of it and resisted some of it.",
  },
  {
    value: 4,
    label: "Softening",
    description: "I stayed with it for long stretches with less tension.",
  },
  {
    value: 5,
    label: "Open",
    description: "I let it be there with very little resistance.",
  },
];

const RELIEF_FILTERS: Array<{ id: ReliefFilter; label: string }> = [
  { id: "all", label: "All sessions" },
  { id: "relief", label: "Relief only" },
  { id: "no-relief", label: "No relief" },
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TREND_DAYS = 21;

const VIEW_OPTIONS: Array<{
  id: AppView;
  label: string;
  note: string;
}> = [
  {
    id: "all",
    label: "All",
    note: "See the full flow with every section in its current layout.",
  },
  {
    id: "let-go",
    label: "Let Go",
    note: "Stay with the core philosophy, guidance, and at-a-glance stats.",
  },
  {
    id: "start-session",
    label: "Start Session",
    note: "Focus only on the live sit, reflection, or session-start workspace.",
  },
  {
    id: "analytics",
    label: "Analytics",
    note: "Zoom in on progress, method patterns, and the consciousness marker.",
  },
  {
    id: "calendar",
    label: "Calendar",
    note: "Review practice days and filter sessions by relief.",
  },
  {
    id: "trackers",
    label: "Goal",
    note: "Work only with issues, triggers, and gains outside the session flow.",
  },
  {
    id: "journal",
    label: "Journal",
    note: "Reflect on the day, the feelings that surfaced, and what patterns you noticed.",
  },
  {
    id: "history",
    label: "Session History",
    note: "Browse, edit, and delete your saved sits in one timeline.",
  },
];

const GRAPH_METRICS: GraphMetricConfig[] = [
  {
    id: "sessions",
    label: "Sessions",
    description: "How many sits happened each day.",
    color: "#24392b",
    formatValue: (value) =>
      `${Math.round(value)} session${Math.round(value) === 1 ? "" : "s"}`,
  },
  {
    id: "minutes",
    label: "Minutes",
    description: "Time spent staying with the sensation.",
    color: "#8d5a45",
    formatValue: (value) => `${Math.round(value)} min`,
  },
  {
    id: "allowing",
    label: "Allowing",
    description: "Average openness rating for the day.",
    color: "#c08a28",
    formatValue: (value) => `${value.toFixed(1)}/5`,
  },
  {
    id: "relief",
    label: "Relief rate",
    description: "Percent of sessions that ended with relief.",
    color: "#4c6f57",
    formatValue: (value) => `${Math.round(value)}%`,
  },
];

const JOURNAL_ALLOWANCE_OPTIONS: Array<{
  id: JournalAllowance;
  label: string;
  description: string;
}> = [
  {
    id: "yes",
    label: "Yes",
    description: "I let the sensation be there without much resistance.",
  },
  {
    id: "partly",
    label: "Partly",
    description: "I allowed some of it, but I still tightened or escaped at times.",
  },
  {
    id: "no",
    label: "No",
    description: "I mostly resisted, suppressed, or got pulled fully into the story.",
  },
];

const JOURNAL_STEPS: JournalStepConfig[] = [
  {
    id: "dayKey",
    kind: "date",
    label: "What day are you reflecting on?",
    helper:
      "Pick the day this reflection belongs to. If you selected a calendar day, it is already filled in here.",
  },
  {
    id: "feelingThatPoppedUp",
    kind: "input",
    label: "What feeling popped up?",
    helper:
      "Name the sensation or emotion that stood out the most, even if the label is imperfect.",
    placeholder: "Anxiety, frustration, numbness, relief...",
  },
  {
    id: "daySummary",
    kind: "textarea",
    label: "How would you describe your day?",
    helper:
      "Write about the day itself and what felt most emotionally important.",
    placeholder:
      "What kind of day was it, and what felt most emotionally important?",
  },
  {
    id: "allowance",
    kind: "allowance",
    label: "Did you allow the sensation?",
    helper:
      "Choose the option that feels most honest about how much room you gave the sensation.",
  },
  {
    id: "differentChoice",
    kind: "textarea",
    label: "What could you have done differently?",
    helper:
      "If you had another chance, describe the response that would have felt more aligned.",
    placeholder:
      "If you had a second chance, what response would have felt more aligned?",
  },
  {
    id: "recognizedPatterns",
    kind: "textarea",
    label: "What patterns did you recognize?",
    helper:
      "Notice any loops, beliefs, reactions, or familiar dynamics that kept repeating.",
    placeholder:
      "What repeating reactions, beliefs, or emotional loops did you notice?",
  },
  {
    id: "whatHappened",
    kind: "textarea",
    label: "What happened?",
    helper:
      "Describe what actually unfolded in the clearest, simplest way you can.",
    placeholder: "Describe what actually unfolded.",
  },
  {
    id: "whatWantedToHappen",
    kind: "textarea",
    label: "What did you want to happen?",
    helper:
      "Describe the outcome you were hoping for, even if it felt unrealistic in hindsight.",
    placeholder: "Describe the outcome you were hoping for.",
  },
  {
    id: "differenceFeeling",
    kind: "textarea",
    label: "How did the difference make you feel?",
    helper:
      "Write about the gap between reality and desire, and what that gap stirred up in you.",
    placeholder:
      "What did the gap between reality and desire stir up in you?",
  },
  {
    id: "startOfDayFeeling",
    kind: "textarea",
    label: "How did you start the day feeling?",
    helper:
      "Capture the tone you were carrying before the day really got going.",
    placeholder: "Grounded, flat, hopeful, heavy...",
  },
  {
    id: "endOfDayFeeling",
    kind: "textarea",
    label: "How did you feel at the end of the day?",
    helper:
      "Describe how you feel now that the day is closing and the reflection is settling.",
    placeholder: "How do you feel now that the day is closing?",
  },
];

function createStartForm(): StartFormState {
  return {
    feelingLabel: "",
    prepNote: "",
    method: "open-awareness",
    methodItems: [],
  };
}

function createJournalDraft(dayKey = getDayKey(new Date())): JournalDraft {
  return {
    id: crypto.randomUUID(),
    dayKey,
    daySummary: "",
    feelingThatPoppedUp: "",
    allowance: "partly",
    differentChoice: "",
    recognizedPatterns: "",
    whatHappened: "",
    whatWantedToHappen: "",
    differenceFeeling: "",
    startOfDayFeeling: "",
    endOfDayFeeling: "",
    createdAt: new Date().toISOString(),
  };
}

function createTrackerBoard(): TrackerBoard {
  return {
    currentLevel: null,
    issues: [],
    triggers: [],
    gains: [],
  };
}

function getJournalEntryPreview(entry: JournalEntry) {
  const previewSource =
    [
      entry.daySummary,
      entry.whatHappened,
      entry.recognizedPatterns,
      entry.differenceFeeling,
      entry.startOfDayFeeling || entry.endOfDayFeeling
        ? `Start: ${entry.startOfDayFeeling} End: ${entry.endOfDayFeeling}`
        : "",
    ]
      .map((value) => value.replace(/\s+/g, " ").trim())
      .find(Boolean) ?? "Open this reflection to review the full entry.";

  return previewSource.length > 180
    ? `${previewSource.slice(0, 177)}...`
    : previewSource;
}

function sortSessions(a: LetGoSession, b: LetGoSession) {
  return Date.parse(b.startedAt) - Date.parse(a.startedAt);
}

function clampRating(value: number) {
  return Math.min(5, Math.max(1, Math.round(value)));
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTextList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeLevel(value: unknown): ConsciousnessLevel | null {
  if (typeof value !== "string") {
    return null;
  }

  return LEVELS.some((level) => level.id === value)
    ? (value as ConsciousnessLevel)
    : null;
}

function normalizeJournalAllowance(value: unknown): JournalAllowance {
  return value === "yes" || value === "partly" || value === "no"
    ? value
    : "partly";
}

function getLevelConfig(level: ConsciousnessLevel | null) {
  if (level === null) {
    return null;
  }

  return LEVELS.find((entry) => entry.id === level) ?? null;
}

function getNextLevel(level: ConsciousnessLevel | null) {
  if (level === null) {
    return LEVELS[0] ?? null;
  }

  const currentIndex = LEVELS.findIndex((entry) => entry.id === level);

  if (currentIndex < 0 || currentIndex === LEVELS.length - 1) {
    return null;
  }

  return LEVELS[currentIndex + 1] ?? null;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getMethodConfig(methodId: BringUpMethod) {
  return METHODS.find((method) => method.id === methodId) ?? METHODS[0];
}

function getDayKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortJournalEntries(a: JournalEntry, b: JournalEntry) {
  return (
    b.dayKey.localeCompare(a.dayKey) ||
    Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}

function parseDayKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toMonthStart(value: Date | string) {
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? parseDayKey(value)
      : typeof value === "string"
        ? new Date(value)
        : value;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(month: Date, amount: number) {
  return new Date(month.getFullYear(), month.getMonth() + amount, 1);
}

function buildMonthGrid(month: Date) {
  const firstDay = toMonthStart(month);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
}

function formatMonthLabel(month: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(month);
}

function formatSessionTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDayHeading(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseDayKey(value));
}

function formatDayNumber(value: Date) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(value);
}

function formatTrendLabel(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(value);
}

function getGraphMetricValue(point: TrendPoint, metricId: GraphMetricId) {
  return point[metricId];
}

function buildTrendData(sessions: LetGoSession[], days: number) {
  const groupedSessions = new Map<string, LetGoSession[]>();

  for (const session of sessions) {
    const dayKey = getDayKey(session.startedAt);
    const bucket = groupedSessions.get(dayKey) ?? [];
    bucket.push(session);
    groupedSessions.set(dayKey, bucket);
  }

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (days - 1));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const dayKey = getDayKey(date);
    const daySessions = groupedSessions.get(dayKey) ?? [];
    const totalMinutes = daySessions.reduce(
      (total, session) => total + session.durationSeconds,
      0,
    ) / 60;
    const allowingAverage = daySessions.length
      ? daySessions.reduce(
          (total, session) => total + session.allowingRating,
          0,
        ) / daySessions.length
      : 0;
    const reliefRate = daySessions.length
      ? (daySessions.filter((session) => session.relief).length / daySessions.length) *
        100
      : 0;

    return {
      dayKey,
      label: formatTrendLabel(date),
      sessions: daySessions.length,
      minutes: Math.round(totalMinutes * 10) / 10,
      allowing: Math.round(allowingAverage * 10) / 10,
      relief: Math.round(reliefRate),
    } satisfies TrendPoint;
  });
}

function toLocalDateTimeValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function secondsToDurationInput(durationSeconds: number) {
  return String(Math.max(0.5, Math.round((durationSeconds / 60) * 10) / 10));
}

function buildSessionFromDraft(draft: SessionDraft): LetGoSession {
  const parsedStart = new Date(draft.startedAtLocal);
  const startedAtDate = Number.isNaN(parsedStart.getTime())
    ? new Date()
    : parsedStart;

  const parsedMinutes = Number.parseFloat(draft.durationMinutes);
  const safeMinutes = Number.isFinite(parsedMinutes)
    ? Math.max(0.5, parsedMinutes)
    : 1;
  const durationSeconds = Math.max(30, Math.round(safeMinutes * 60));
  const endedAtDate = new Date(startedAtDate.getTime() + durationSeconds * 1000);

  return {
    id: draft.id,
    feelingLabel: draft.feelingLabel.trim(),
    prepNote: draft.prepNote.trim(),
    method: draft.method,
    methodItems: normalizeTextList(draft.methodItems),
    issues: normalizeTextList(draft.issues),
    triggers: normalizeTextList(draft.triggers),
    gains: normalizeTextList(draft.gains),
    consciousnessLevel: draft.consciousnessLevel,
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationSeconds,
    allowingRating: clampRating(draft.allowingRating),
    relief: draft.relief,
    closingNote: draft.closingNote.trim(),
  };
}

function buildDraftFromSession(session: LetGoSession): SessionDraft {
  return {
    id: session.id,
    feelingLabel: session.feelingLabel,
    prepNote: session.prepNote,
    method: session.method,
    methodItems: [...session.methodItems],
    issues: [...session.issues],
    triggers: [...session.triggers],
    gains: [...session.gains],
    consciousnessLevel: session.consciousnessLevel,
    startedAtLocal: toLocalDateTimeValue(session.startedAt),
    durationMinutes: secondsToDurationInput(session.durationSeconds),
    allowingRating: session.allowingRating,
    relief: session.relief,
    closingNote: session.closingNote,
  };
}

function buildJournalEntryFromDraft(draft: JournalDraft): JournalEntry {
  const now = new Date().toISOString();

  return {
    id: draft.id,
    dayKey: normalizeText(draft.dayKey) || getDayKey(now),
    daySummary: draft.daySummary.trim(),
    feelingThatPoppedUp: draft.feelingThatPoppedUp.trim(),
    allowance: draft.allowance,
    differentChoice: draft.differentChoice.trim(),
    recognizedPatterns: draft.recognizedPatterns.trim(),
    whatHappened: draft.whatHappened.trim(),
    whatWantedToHappen: draft.whatWantedToHappen.trim(),
    differenceFeeling: draft.differenceFeeling.trim(),
    startOfDayFeeling: draft.startOfDayFeeling.trim(),
    endOfDayFeeling: draft.endOfDayFeeling.trim(),
    createdAt: draft.createdAt,
    updatedAt: now,
  };
}

function buildDraftFromJournalEntry(entry: JournalEntry): JournalDraft {
  return {
    id: entry.id,
    dayKey: entry.dayKey,
    daySummary: entry.daySummary,
    feelingThatPoppedUp: entry.feelingThatPoppedUp,
    allowance: entry.allowance,
    differentChoice: entry.differentChoice,
    recognizedPatterns: entry.recognizedPatterns,
    whatHappened: entry.whatHappened,
    whatWantedToHappen: entry.whatWantedToHappen,
    differenceFeeling: entry.differenceFeeling,
    startOfDayFeeling: entry.startOfDayFeeling,
    endOfDayFeeling: entry.endOfDayFeeling,
    createdAt: entry.createdAt,
  };
}

function buildDraftFromActiveSession(
  activeSession: ActiveSession,
  durationSeconds: number,
): SessionDraft {
  return {
    id: activeSession.id,
    feelingLabel: activeSession.feelingLabel,
    prepNote: activeSession.prepNote,
    method: activeSession.method,
    methodItems: [...activeSession.methodItems],
    issues: [],
    triggers: [],
    gains: [],
    consciousnessLevel: null,
    startedAtLocal: toLocalDateTimeValue(
      new Date(activeSession.startedAtMs).toISOString(),
    ),
    durationMinutes: secondsToDurationInput(durationSeconds),
    allowingRating: 3,
    relief: true,
    closingNote: "",
  };
}

function parseStoredSession(value: unknown): LetGoSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Record<string, unknown>;
  const method =
    typeof session.method === "string" &&
    METHODS.some((configuredMethod) => configuredMethod.id === session.method)
      ? (session.method as BringUpMethod)
      : null;

  const startedAt =
    typeof session.startedAt === "string" &&
    !Number.isNaN(Date.parse(session.startedAt))
      ? session.startedAt
      : null;
  const endedAt =
    typeof session.endedAt === "string" &&
    !Number.isNaN(Date.parse(session.endedAt))
      ? session.endedAt
      : null;
  const id = normalizeText(session.id);

  if (!method || !startedAt || !endedAt || !id) {
    return null;
  }

  const parsedDuration =
    typeof session.durationSeconds === "number" &&
    Number.isFinite(session.durationSeconds)
      ? Math.round(session.durationSeconds)
      : Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000);

  return {
    id,
    feelingLabel: normalizeText(session.feelingLabel),
    prepNote: normalizeText(session.prepNote),
    method,
    methodItems: normalizeTextList(session.methodItems),
    issues: normalizeTextList(session.issues),
    triggers: normalizeTextList(session.triggers),
    gains: normalizeTextList(session.gains),
    consciousnessLevel: normalizeLevel(session.consciousnessLevel),
    startedAt,
    endedAt,
    durationSeconds: Math.max(1, parsedDuration || 1),
    allowingRating:
      typeof session.allowingRating === "number"
        ? clampRating(session.allowingRating)
        : 3,
    relief: Boolean(session.relief),
    closingNote: normalizeText(session.closingNote),
  };
}

function parseStoredJournalEntry(value: unknown): JournalEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entry = value as Record<string, unknown>;
  const createdAt =
    typeof entry.createdAt === "string" &&
    !Number.isNaN(Date.parse(entry.createdAt))
      ? entry.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof entry.updatedAt === "string" &&
    !Number.isNaN(Date.parse(entry.updatedAt))
      ? entry.updatedAt
      : createdAt;
  const dayKey =
    typeof entry.dayKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.dayKey)
      ? entry.dayKey
      : getDayKey(createdAt);
  const id = normalizeText(entry.id);

  if (!id) {
    return null;
  }

  return {
    id,
    dayKey,
    daySummary: normalizeText(entry.daySummary),
    feelingThatPoppedUp: normalizeText(entry.feelingThatPoppedUp),
    allowance: normalizeJournalAllowance(entry.allowance),
    differentChoice: normalizeText(entry.differentChoice),
    recognizedPatterns: normalizeText(entry.recognizedPatterns),
    whatHappened: normalizeText(entry.whatHappened),
    whatWantedToHappen: normalizeText(entry.whatWantedToHappen),
    differenceFeeling: normalizeText(entry.differenceFeeling),
    startOfDayFeeling: normalizeText(entry.startOfDayFeeling),
    endOfDayFeeling: normalizeText(entry.endOfDayFeeling),
    createdAt,
    updatedAt,
  };
}

function parseStoredTrackers(value: unknown): TrackerBoard {
  if (!value || typeof value !== "object") {
    return createTrackerBoard();
  }

  const trackers = value as Record<string, unknown>;

  return {
    currentLevel: normalizeLevel(trackers.currentLevel),
    issues: normalizeTextList(trackers.issues),
    triggers: normalizeTextList(trackers.triggers),
    gains: normalizeTextList(trackers.gains),
  };
}

function parseImportPayload(value: unknown): ImportPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const hasRecognizedShape =
    "sessions" in payload ||
    "journalEntries" in payload ||
    "trackers" in payload ||
    "themeMode" in payload;

  if (!hasRecognizedShape) {
    return null;
  }

  const sessions = Array.isArray(payload.sessions)
    ? payload.sessions
        .map((session) => parseStoredSession(session))
        .filter((session): session is LetGoSession => session !== null)
        .sort(sortSessions)
    : [];
  const journalEntries = Array.isArray(payload.journalEntries)
    ? payload.journalEntries
        .map((entry) => parseStoredJournalEntry(entry))
        .filter((entry): entry is JournalEntry => entry !== null)
        .sort(sortJournalEntries)
    : [];
  const trackers =
    "trackers" in payload
      ? parseStoredTrackers(payload.trackers)
      : seedTrackersFromSessions(sessions);

  return {
    sessions,
    journalEntries,
    trackers,
    themeMode: isThemeMode(payload.themeMode) ? payload.themeMode : null,
  };
}

function seedTrackersFromSessions(sessions: LetGoSession[]) {
  return {
    currentLevel:
      sessions.find((session) => session.consciousnessLevel !== null)
        ?.consciousnessLevel ?? null,
    issues: getCountEntries(sessions.flatMap((session) => session.issues)).map(
      (item) => item.label,
    ),
    triggers: getCountEntries(
      sessions.flatMap((session) => session.triggers),
    ).map((item) => item.label),
    gains: getCountEntries(sessions.flatMap((session) => session.gains)).map(
      (item) => item.label,
    ),
  } satisfies TrackerBoard;
}

function getCurrentStreak(sessions: LetGoSession[]) {
  const practiceDays = new Set(sessions.map((session) => getDayKey(session.startedAt)));

  if (practiceDays.size === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let cursor: Date | null = null;

  if (practiceDays.has(getDayKey(today))) {
    cursor = today;
  } else if (practiceDays.has(getDayKey(yesterday))) {
    cursor = yesterday;
  }

  let streak = 0;

  while (cursor && practiceDays.has(getDayKey(cursor))) {
    streak += 1;
    const previous = new Date(cursor);
    previous.setDate(previous.getDate() - 1);
    cursor = previous;
  }

  return streak;
}

function matchesReliefFilter(session: LetGoSession, filter: ReliefFilter) {
  if (filter === "relief") {
    return session.relief;
  }

  if (filter === "no-relief") {
    return !session.relief;
  }

  return true;
}

function getCountEntries(items: string[]) {
  const counts = new Map<string, CountEntry>();

  for (const item of normalizeTextList(items)) {
    const key = item.toLowerCase();
    const existing = counts.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: item, count: 1 });
    }
  }

  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

export default function LettingGoApp() {
  const [sessions, setSessions] = useState<LetGoSession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [trackers, setTrackers] = useState<TrackerBoard>(createTrackerBoard());
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [startForm, setStartForm] = useState<StartFormState>(createStartForm());
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [draftMode, setDraftMode] = useState<"new" | "edit" | null>(null);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [reliefFilter, setReliefFilter] = useState<ReliefFilter>("all");
  const [activeView, setActiveView] = useState<AppView>("all");
  const [activeGraphMetrics, setActiveGraphMetrics] = useState<GraphMetricId[]>(
    () => GRAPH_METRICS.map((metric) => metric.id),
  );
  const [journalDraftMode, setJournalDraftMode] = useState<"new" | "edit">("new");
  const [journalDraft, setJournalDraft] = useState<JournalDraft>(() =>
    createJournalDraft(getDayKey(new Date())),
  );
  const [journalStepIndex, setJournalStepIndex] = useState(0);
  const [isJournalListCollapsed, setIsJournalListCollapsed] = useState(false);
  const [expandedJournalEntryIds, setExpandedJournalEntryIds] = useState<string[]>(
    [],
  );
  const [dataTransferNotice, setDataTransferNotice] =
    useState<DataTransferNotice | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const rawSessions = window.localStorage.getItem(STORAGE_KEY);
      const rawJournalEntries = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
      const rawTrackers = window.localStorage.getItem(TRACKERS_STORAGE_KEY);
      const rawTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const parsedSessions = rawSessions ? (JSON.parse(rawSessions) as unknown) : null;
      const parsedJournalEntries = rawJournalEntries
        ? (JSON.parse(rawJournalEntries) as unknown)
        : null;
      const nextSessions =
        Array.isArray(parsedSessions)
          ? parsedSessions
              .map((session) => parseStoredSession(session))
              .filter((session): session is LetGoSession => session !== null)
              .sort(sortSessions)
          : [];
      const nextJournalEntries =
        Array.isArray(parsedJournalEntries)
          ? parsedJournalEntries
              .map((entry) => parseStoredJournalEntry(entry))
              .filter((entry): entry is JournalEntry => entry !== null)
              .sort(sortJournalEntries)
          : [];

      if (rawTheme === "dark" || rawTheme === "light") {
        setThemeMode(rawTheme);
      }

      setSessions(nextSessions);
      setJournalEntries(nextJournalEntries);
      setTrackers(
        rawTrackers
          ? parseStoredTrackers(JSON.parse(rawTrackers) as unknown)
          : seedTrackersFromSessions(nextSessions),
      );
    } catch {
      // Ignore malformed local data and start fresh.
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [hasHydrated, sessions]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(
      JOURNAL_STORAGE_KEY,
      JSON.stringify(journalEntries),
    );
  }, [hasHydrated, journalEntries]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(TRACKERS_STORAGE_KEY, JSON.stringify(trackers));
  }, [hasHydrated, trackers]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.documentElement.dataset.theme = themeMode;
  }, [hasHydrated, themeMode]);

  const syncElapsed = useEffectEvent(() => {
    if (!activeSession) {
      return;
    }

    const seconds = Math.max(
      1,
      Math.round((Date.now() - activeSession.startedAtMs) / 1000),
    );

    setElapsedSeconds(seconds);
  });

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    syncElapsed();

    const intervalId = window.setInterval(() => {
      syncElapsed();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSession]);

  useEffect(() => {
    if (journalDraftMode !== "new" || !selectedDay) {
      return;
    }

    setJournalDraft((current) => ({ ...current, dayKey: selectedDay }));
  }, [journalDraftMode, selectedDay]);

  const selectedMethodConfig = getMethodConfig(startForm.method);
  const draftMethodConfig = sessionDraft
    ? getMethodConfig(sessionDraft.method)
    : null;
  const totalDurationSeconds = sessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  );
  const reliefCount = sessions.filter((session) => session.relief).length;
  const practiceDays = new Set(
    sessions.map((session) => getDayKey(session.startedAt)),
  ).size;
  const averageAllowing = sessions.length
    ? (
        sessions.reduce((total, session) => total + session.allowingRating, 0) /
        sessions.length
      ).toFixed(1)
    : "0.0";
  const reliefRate = sessions.length
    ? Math.round((reliefCount / sessions.length) * 100)
    : 0;
  const currentStreak = getCurrentStreak(sessions);
  const displayedJournalEntries = selectedDay
    ? journalEntries.filter((entry) => entry.dayKey === selectedDay)
    : journalEntries;
  const filteredSessions = sessions.filter((session) =>
    matchesReliefFilter(session, reliefFilter),
  );
  const displayedSessions = selectedDay
    ? filteredSessions.filter(
        (session) => getDayKey(session.startedAt) === selectedDay,
      )
    : filteredSessions;
  const sessionsByDay: Record<string, LetGoSession[]> = {};

  for (const session of filteredSessions) {
    const dayKey = getDayKey(session.startedAt);
    const bucket = sessionsByDay[dayKey] ?? [];
    bucket.push(session);
    sessionsByDay[dayKey] = bucket;
  }

  const methodBreakdown = METHODS.map((method) => {
    const methodSessions = sessions.filter((session) => session.method === method.id);
    const methodReliefCount = methodSessions.filter((session) => session.relief).length;

    return {
      id: method.id,
      label: method.label,
      count: methodSessions.length,
      reliefRate: methodSessions.length
        ? Math.round((methodReliefCount / methodSessions.length) * 100)
        : 0,
      minutes: Math.round(
        methodSessions.reduce(
          (total, session) => total + session.durationSeconds,
          0,
        ) / 60,
      ),
    };
  });
  const currentLevelConfig = getLevelConfig(trackers.currentLevel);
  const nextLevelConfig = getNextLevel(trackers.currentLevel);
  const trendData = buildTrendData(sessions, TREND_DAYS);
  const visibleGraphMetrics = GRAPH_METRICS.filter((metric) =>
    activeGraphMetrics.includes(metric.id),
  );
  const journalDraftHasContent = [
    journalDraft.daySummary,
    journalDraft.feelingThatPoppedUp,
    journalDraft.differentChoice,
    journalDraft.recognizedPatterns,
    journalDraft.whatHappened,
    journalDraft.whatWantedToHappen,
    journalDraft.differenceFeeling,
    journalDraft.startOfDayFeeling,
    journalDraft.endOfDayFeeling,
  ].some((value) => value.trim().length > 0);
  const currentJournalStep =
    JOURNAL_STEPS[journalStepIndex] ?? JOURNAL_STEPS[0];
  const isFirstJournalStep = journalStepIndex === 0;
  const isLastJournalStep = journalStepIndex === JOURNAL_STEPS.length - 1;
  const journalStepProgress =
    ((journalStepIndex + 1) / JOURNAL_STEPS.length) * 100;
  const journalPanelHeightClass = "h-[44rem] sm:h-[46rem] xl:h-[48rem]";
  const activeViewConfig =
    VIEW_OPTIONS.find((view) => view.id === activeView) ?? VIEW_OPTIONS[0];
  const showLetGoPanel = activeView === "all" || activeView === "let-go";
  const showSessionPanel = activeView === "all" || activeView === "start-session";
  const showAnalyticsPanel = activeView === "all" || activeView === "analytics";
  const showCalendarPanel = activeView === "all" || activeView === "calendar";
  const showTrackersPanel = activeView === "all" || activeView === "trackers";
  const showJournalPanel = activeView === "all" || activeView === "journal";
  const showHistoryPanel = activeView === "all" || activeView === "history";
  const hasOverviewPair = showLetGoPanel && showSessionPanel;

  const monthGrid = buildMonthGrid(selectedMonth);
  const historyLocked = activeSession !== null || sessionDraft !== null;

  function updateStartForm<K extends keyof StartFormState>(
    key: K,
    value: StartFormState[K],
  ) {
    setStartForm((current) => ({ ...current, [key]: value }));
  }

  function updateTrackers<K extends keyof TrackerBoard>(
    key: K,
    value: TrackerBoard[K],
  ) {
    setTrackers((current) => ({ ...current, [key]: value }));
  }

  function updateDraft<K extends keyof SessionDraft>(
    key: K,
    value: SessionDraft[K],
  ) {
    setSessionDraft((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  function updateJournalDraft<K extends keyof JournalDraft>(
    key: K,
    value: JournalDraft[K],
  ) {
    setJournalDraft((current) => ({ ...current, [key]: value }));
  }

  function handleStartSession() {
    if (activeSession || sessionDraft) {
      return;
    }

    setActiveSession({
      id: crypto.randomUUID(),
      feelingLabel: startForm.feelingLabel.trim(),
      prepNote: startForm.prepNote.trim(),
      method: startForm.method,
      methodItems: startForm.methodItems,
      startedAtMs: Date.now(),
    });
    setElapsedSeconds(0);
  }

  function handleCancelSession() {
    setActiveSession(null);
    setElapsedSeconds(0);
  }

  function handleFinishSession() {
    if (!activeSession) {
      return;
    }

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - activeSession.startedAtMs) / 1000),
    );

    setDraftMode("new");
    setSessionDraft(buildDraftFromActiveSession(activeSession, durationSeconds));
    setActiveSession(null);
    setElapsedSeconds(0);
  }

  function handleSaveDraft() {
    if (!sessionDraft) {
      return;
    }

    const nextSession = buildSessionFromDraft(sessionDraft);

    setSessions((currentSessions) => {
      if (draftMode === "edit") {
        return currentSessions
          .map((session) => (session.id === nextSession.id ? nextSession : session))
          .sort(sortSessions);
      }

      return [nextSession, ...currentSessions].sort(sortSessions);
    });

    setSelectedMonth(toMonthStart(nextSession.startedAt));
    setSelectedDay(getDayKey(nextSession.startedAt));
    setDraftMode(null);
    setSessionDraft(null);

    if (draftMode === "new") {
      setStartForm((current) => ({
        ...createStartForm(),
        method: current.method,
      }));
    }
  }

  function handleDiscardDraft() {
    setDraftMode(null);
    setSessionDraft(null);
  }

  function handleEditSession(session: LetGoSession) {
    if (historyLocked) {
      return;
    }

    setDraftMode("edit");
    setSessionDraft(buildDraftFromSession(session));
  }

  function handleDeleteSession(session: LetGoSession) {
    if (historyLocked) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the session "${session.feelingLabel || "Unlabeled sensation"}"?`,
    );

    if (!confirmed) {
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.filter((currentSession) => currentSession.id !== session.id),
    );
  }

  function handleShiftMonth(amount: number) {
    startTransition(() => {
      setSelectedMonth((currentMonth) => shiftMonth(currentMonth, amount));
      setSelectedDay(null);
    });
  }

  function handleToggleGraphMetric(metricId: GraphMetricId) {
    setActiveGraphMetrics((currentMetrics) =>
      currentMetrics.includes(metricId)
        ? currentMetrics.filter((currentMetric) => currentMetric !== metricId)
        : [...currentMetrics, metricId],
    );
  }

  function handleGoToPreviousJournalStep() {
    setJournalStepIndex((currentStep) => Math.max(0, currentStep - 1));
  }

  function handleAdvanceJournalStep() {
    if (isLastJournalStep) {
      handleSaveJournalEntry();
      return;
    }

    setJournalStepIndex((currentStep) =>
      Math.min(JOURNAL_STEPS.length - 1, currentStep + 1),
    );
  }

  function handleSaveJournalEntry() {
    if (!journalDraftHasContent) {
      return;
    }

    const nextEntry = buildJournalEntryFromDraft(journalDraft);

    setJournalEntries((currentEntries) => {
      if (journalDraftMode === "edit") {
        return currentEntries
          .map((entry) => (entry.id === nextEntry.id ? nextEntry : entry))
          .sort(sortJournalEntries);
      }

      return [nextEntry, ...currentEntries].sort(sortJournalEntries);
    });

    setJournalDraftMode("new");
    setJournalDraft(createJournalDraft(nextEntry.dayKey));
    setJournalStepIndex(0);
    setExpandedJournalEntryIds((currentIds) =>
      currentIds.filter((entryId) => entryId !== nextEntry.id),
    );
    setSelectedMonth(toMonthStart(nextEntry.dayKey));
  }

  function handleEditJournalEntry(entry: JournalEntry) {
    setJournalDraftMode("edit");
    setJournalDraft(buildDraftFromJournalEntry(entry));
    setJournalStepIndex(0);
  }

  function handleCancelJournalEdit() {
    setJournalDraftMode("new");
    setJournalDraft(createJournalDraft(selectedDay ?? getDayKey(new Date())));
    setJournalStepIndex(0);
  }

  function handleDeleteJournalEntry(entry: JournalEntry) {
    const confirmed = window.confirm(
      `Delete the journal entry for ${formatDayHeading(entry.dayKey)}?`,
    );

    if (!confirmed) {
      return;
    }

    setJournalEntries((currentEntries) =>
      currentEntries.filter((currentEntry) => currentEntry.id !== entry.id),
    );
    setExpandedJournalEntryIds((currentIds) =>
      currentIds.filter((entryId) => entryId !== entry.id),
    );

    if (journalDraftMode === "edit" && journalDraft.id === entry.id) {
      setJournalDraftMode("new");
      setJournalDraft(createJournalDraft(selectedDay ?? getDayKey(new Date())));
      setJournalStepIndex(0);
    }
  }

  function handleToggleJournalList() {
    setIsJournalListCollapsed((current) => !current);
  }

  function handleToggleJournalEntry(entryId: string) {
    setExpandedJournalEntryIds((currentIds) =>
      currentIds.includes(entryId)
        ? currentIds.filter((currentId) => currentId !== entryId)
        : [...currentIds, entryId],
    );
  }

  function handleExportData() {
    if (!hasHydrated) {
      return;
    }

    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions,
      journalEntries,
      trackers,
      themeMode,
    };
    const fileName = `letgo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const fileBlob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 0);

    setDataTransferNotice({
      tone: "success",
      message: `Backup downloaded with ${sessions.length} session${sessions.length === 1 ? "" : "s"} and ${journalEntries.length} journal entr${journalEntries.length === 1 ? "y" : "ies"}.`,
    });
  }

  function handleOpenImportPicker() {
    if (!hasHydrated) {
      return;
    }

    importInputRef.current?.click();
  }

  async function handleImportData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const importWarning =
      activeSession || sessionDraft
        ? " This will also discard the in-progress session or unsaved reflection."
        : "";
    const confirmed = window.confirm(
      `Importing a backup will replace your current saved sessions, journal entries, trackers, and theme.${importWarning}`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const fileText = await file.text();
      const imported = parseImportPayload(JSON.parse(fileText) as unknown);

      if (!imported) {
        throw new Error("Invalid import payload");
      }

      setSessions(imported.sessions);
      setJournalEntries(imported.journalEntries);
      setTrackers(imported.trackers);
      setThemeMode(imported.themeMode ?? themeMode);
      setActiveSession(null);
      setElapsedSeconds(0);
      setDraftMode(null);
      setSessionDraft(null);
      setJournalDraftMode("new");
      setJournalDraft(createJournalDraft());
      setJournalStepIndex(0);
      setExpandedJournalEntryIds([]);
      setSelectedDay(null);
      setSelectedMonth(
        imported.sessions[0]
          ? toMonthStart(imported.sessions[0].startedAt)
          : imported.journalEntries[0]
            ? toMonthStart(imported.journalEntries[0].dayKey)
          : toMonthStart(new Date()),
      );
      setReliefFilter("all");
      setDataTransferNotice({
        tone: "success",
        message: `Imported ${imported.sessions.length} session${imported.sessions.length === 1 ? "" : "s"} and ${imported.journalEntries.length} journal entr${imported.journalEntries.length === 1 ? "y" : "ies"} from ${file.name}.`,
      });
    } catch {
      setDataTransferNotice({
        tone: "error",
        message: "Import failed. Choose a valid Let Go backup JSON file.",
      });
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-7rem] left-[-5rem] h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl" />
        <div className="absolute right-[-7rem] top-28 h-80 w-80 rounded-full bg-[rgba(76,111,87,0.16)] blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="sticky top-3 z-20">
          <div className="relative overflow-hidden rounded-[1.7rem] border border-black/10 bg-white/28 px-4 py-4 shadow-[0_18px_50px_rgba(24,38,29,0.08)] backdrop-blur-xl sm:px-5">
            <div className="soft-grid absolute inset-0 opacity-25" />

            <div className="relative flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-xl">
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/38">
                    Navigation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/58">
                    {activeViewConfig.note}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={!hasHydrated}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      hasHydrated
                        ? "border-black/10 bg-white/35 text-black/72 hover:bg-white/55"
                        : "cursor-not-allowed border-black/10 bg-white/20 text-black/35"
                    }`}
                  >
                    Export data
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenImportPicker}
                    disabled={!hasHydrated}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      hasHydrated
                        ? "border-black/10 bg-white/35 text-black/72 hover:bg-white/55"
                        : "cursor-not-allowed border-black/10 bg-white/20 text-black/35"
                    }`}
                  >
                    Import data
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setThemeMode((currentMode) =>
                        currentMode === "light" ? "dark" : "light",
                      )
                    }
                    className="rounded-full border border-black/10 bg-white/35 px-4 py-2 text-sm font-medium text-black/72 transition hover:bg-white/55"
                  >
                    {themeMode === "light" ? "Dark mode" : "Light mode"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {VIEW_OPTIONS.map((view) => {
                  const isSelected = activeView === view.id;

                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setActiveView(view.id);
                        });
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "bg-[var(--foreground)] text-white shadow-[0_10px_30px_rgba(24,38,29,0.16)]"
                          : "border border-black/10 bg-white/32 text-black/70 hover:bg-white/52"
                      }`}
                    >
                      {view.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`grid gap-6 ${
            hasOverviewPair ? "xl:grid-cols-[1.05fr_0.95fr]" : ""
          }`}
        >
          {showLetGoPanel ? (
            <div className="panel-surface panel-strong relative overflow-hidden rounded-[2rem] px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="soft-grid absolute inset-0 opacity-35" />

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="space-y-7">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-black/45">
                      Let Go
                    </p>
                    <span className="rounded-full border border-black/10 bg-white/32 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-black/42">
                      {activeViewConfig.label}
                    </span>
                  </div>
                  <h1 className="max-w-3xl font-serif text-5xl leading-[0.92] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                    Meet what is here until it softens.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
                    This is where the real work begins, learning to embrace discomfort and allow it to transform you into who you’ve always been. As you stay present with the sensations that once overwhelmed you, you begin to uncover your natural charisma, wisdom, and inner power.</p>
                  {dataTransferNotice ? (
                    <p
                      aria-live="polite"
                      className={`max-w-2xl rounded-[1.1rem] px-4 py-3 text-sm leading-6 ${
                        dataTransferNotice.tone === "success"
                          ? "border border-[rgba(76,111,87,0.2)] bg-[rgba(76,111,87,0.12)] text-[var(--success)]"
                          : "border border-[rgba(155,111,64,0.2)] bg-[rgba(155,111,64,0.12)] text-[var(--warning)]"
                      }`}
                    >
                      {dataTransferNotice.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border-t border-black/10 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      1. Bring it up
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/65">
                      Use shadow work, a feared scenario, a memory, or open
                      awareness to bring the sensation into the body.
                    </p>
                  </div>
                  <div className="border-t border-black/10 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      2. Allow it
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/65">
                      Relax the resistance, stay with the body, and let the sensation
                      unwind without forcing a result.
                    </p>
                  </div>
                  <div className="border-t border-black/10 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      3. Log the shift
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/65">
                      Save the timed session with its method notes, relief status, and
                      allowing quality so you can revisit it later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <QuickMetric
                  label="Sessions"
                  value={hasHydrated ? String(sessions.length) : "--"}
                />
                <QuickMetric
                  label="Practice days"
                  value={hasHydrated ? String(practiceDays) : "--"}
                />
                <QuickMetric
                  label="Current streak"
                  value={
                    hasHydrated
                      ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}`
                      : "--"
                  }
                />
                <QuickMetric
                  label="Tracked gains"
                  value={hasHydrated ? String(trackers.gains.length) : "--"}
                />
              </div>
            </div>
          </div>
          ) : null}

          {showSessionPanel ? (
            <div className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8 sm:py-8">
            {activeSession ? (
              <div className="flex h-full flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                      Session live
                    </p>
                    <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                      Stay with the sensation.
                    </h2>
                  </div>
                  <span className="rounded-full border border-[rgba(76,111,87,0.2)] bg-[rgba(76,111,87,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--success)]">
                    In progress
                  </span>
                </div>

                <div className="rounded-[1.6rem] border border-black/10 bg-white/55 px-5 py-6">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                    Timer
                  </p>
                  <p className="mt-3 font-serif text-6xl leading-none tracking-[-0.05em] sm:text-7xl">
                    {formatDuration(elapsedSeconds)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-black/55">
                    <span className="rounded-full bg-black/5 px-3 py-1">
                      {getMethodConfig(activeSession.method).label}
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1">
                      {activeSession.feelingLabel || "Unlabeled sensation"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-t border-black/10 pt-4">
                    <p className="text-sm font-medium text-black/80">
                      {getMethodConfig(activeSession.method).guidance}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/55">
                      {getMethodConfig(activeSession.method).support}
                    </p>
                  </div>

                  {activeSession.prepNote ? (
                    <div className="rounded-[1.35rem] border border-black/10 bg-white/45 px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                        What you brought in
                      </p>
                      <p className="mt-2 text-sm leading-6 text-black/65">
                        {activeSession.prepNote}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-3">
                    <PracticeCue
                      title="Allow"
                      body="Notice where you tense against the feeling and soften there first."
                    />
                    <PracticeCue
                      title="Feel"
                      body="Stay with the body sensation rather than following the story away."
                    />
                    <PracticeCue
                      title="Track"
                      body="Notice what thoughts or images keep coming back and write them into the session notes if needed."
                    />
                  </div>

                  <SessionListBlock
                    title={getMethodConfig(activeSession.method).itemLabel}
                    items={activeSession.methodItems}
                  />
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleFinishSession}
                    className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    Finish and reflect
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSession}
                    className="rounded-full border border-black/10 bg-white/45 px-5 py-3 text-sm font-medium text-black/70 transition hover:bg-white/65"
                  >
                    Cancel session
                  </button>
                </div>
              </div>
            ) : sessionDraft ? (
              <div className="flex h-full flex-col gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                    {draftMode === "edit" ? "Edit session" : "Close the loop"}
                  </p>
                  <h2 className="font-serif text-3xl tracking-[-0.04em]">
                    {draftMode === "edit"
                      ? "Update the saved details."
                      : "Capture what happened in the sit."}
                  </h2>
                  <p className="text-sm leading-6 text-black/60">
                    Save the content of the session, the method-specific notes,
                    and what shifted afterward.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-3">
                    <span className="text-sm font-medium text-black/80">
                      Sensation or feeling
                    </span>
                    <input
                      value={sessionDraft.feelingLabel}
                      onChange={(event) =>
                        updateDraft("feelingLabel", event.target.value)
                      }
                      placeholder="Tight chest, shame, dread, numbness..."
                      className="w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-sm font-medium text-black/80">
                      Started at
                    </span>
                    <input
                      type="datetime-local"
                      value={sessionDraft.startedAtLocal}
                      onChange={(event) =>
                        updateDraft("startedAtLocal", event.target.value)
                      }
                      className="w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm text-black/80 outline-none transition focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-3">
                    <span className="text-sm font-medium text-black/80">
                      Duration in minutes
                    </span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={sessionDraft.durationMinutes}
                      onChange={(event) =>
                        updateDraft("durationMinutes", event.target.value)
                      }
                      className="w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm text-black/80 outline-none transition focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-sm font-medium text-black/80">
                      Optional context note
                    </span>
                    <textarea
                      value={sessionDraft.prepNote}
                      onChange={(event) =>
                        updateDraft("prepNote", event.target.value)
                      }
                      rows={3}
                      placeholder="What were you walking in with?"
                      className="min-h-24 w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm leading-6 text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-black/80">
                    Bring-up method
                  </p>
                  <MethodSelector
                    value={sessionDraft.method}
                    onChange={(value) => updateDraft("method", value)}
                  />
                </div>

                {draftMethodConfig ? (
                  <div className="rounded-[1.5rem] border border-black/10 bg-white/55 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      Method prompt
                    </p>
                    <p className="mt-2 text-sm font-medium text-black/80">
                      {draftMethodConfig.setupLabel}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/60">
                      {draftMethodConfig.itemHint}
                    </p>
                  </div>
                ) : null}

                {draftMethodConfig ? (
                  <ItemListEditor
                    label={draftMethodConfig.itemLabel}
                    hint={draftMethodConfig.itemHint}
                    items={sessionDraft.methodItems}
                    onChange={(items) => updateDraft("methodItems", items)}
                    addLabel={draftMethodConfig.addItemLabel}
                    placeholder={draftMethodConfig.itemPlaceholder}
                    emptyText="Nothing saved for this method yet."
                  />
                ) : null}

                <div className="space-y-3">
                  <label className="text-sm font-medium text-black/80">
                    Allowing quality
                  </label>
                  <RatingSelector
                    value={sessionDraft.allowingRating}
                    onChange={(value) => updateDraft("allowingRating", value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-black/80">
                    Relief at the end
                  </label>
                  <ReliefSelector
                    value={sessionDraft.relief}
                    onChange={(value) => updateDraft("relief", value)}
                  />
                </div>

                <label className="space-y-3">
                  <span className="text-sm font-medium text-black/80">
                    Closing note
                  </span>
                  <textarea
                    value={sessionDraft.closingNote}
                    onChange={(event) =>
                      updateDraft("closingNote", event.target.value)
                    }
                    rows={4}
                    placeholder="What shifted, resisted, or became clearer?"
                    className="min-h-28 w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm leading-6 text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                  />
                </label>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    {draftMode === "edit" ? "Save changes" : "Save session"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="rounded-full border border-black/10 bg-white/45 px-5 py-3 text-sm font-medium text-black/70 transition hover:bg-white/65"
                  >
                    {draftMode === "edit" ? "Cancel edit" : "Discard reflection"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                    Start a session
                  </p>
                  <h2 className="font-serif text-3xl tracking-[-0.04em]">
                    Pick a doorway into the feeling.
                  </h2>
                  <p className="text-sm leading-6 text-black/60">
                    Set the context first, then let the timer hold the session.
                  </p>
                </div>

                <label className="space-y-3">
                  <span className="text-sm font-medium text-black/80">
                    Sensation or feeling
                  </span>
                  <input
                    value={startForm.feelingLabel}
                    onChange={(event) =>
                      updateStartForm("feelingLabel", event.target.value)
                    }
                    placeholder="Tight chest, shame, dread, anger, numbness..."
                    className="w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                  />
                </label>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-black/80">
                    Bring-up method
                  </p>
                  <MethodSelector
                    value={startForm.method}
                    onChange={(value) => updateStartForm("method", value)}
                  />
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-white/55 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                    Prompt
                  </p>
                  <p className="mt-2 text-sm font-medium text-black/80">
                    {selectedMethodConfig.setupLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/60">
                    {selectedMethodConfig.guidance}
                  </p>
                </div>

                <ItemListEditor
                  label={selectedMethodConfig.itemLabel}
                  hint={selectedMethodConfig.itemHint}
                  items={startForm.methodItems}
                  onChange={(items) => updateStartForm("methodItems", items)}
                  addLabel={selectedMethodConfig.addItemLabel}
                  placeholder={selectedMethodConfig.itemPlaceholder}
                  emptyText="Nothing written for this method yet."
                />

                <label className="space-y-3">
                  <span className="text-sm font-medium text-black/80">
                    Optional context note
                  </span>
                  <textarea
                    value={startForm.prepNote}
                    onChange={(event) =>
                      updateStartForm("prepNote", event.target.value)
                    }
                    rows={4}
                    placeholder="What is happening around this sensation right now?"
                    className="min-h-28 w-full rounded-[1.3rem] border border-black/10 bg-white/55 px-4 py-3 text-sm leading-6 text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/75"
                  />
                </label>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-sm leading-6 text-black/55">
                    This version stays local on this device and saves every session
                    with its notes, timing, and reflection.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartSession}
                    className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    Start timer
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : null}
        </section>

        {showAnalyticsPanel ? (
          <section className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                  Analytics
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                  Practice over time
                </h2>
              </div>
              <p className="text-sm text-black/55">
                {sessions.length > 0
                  ? `${sessions.length} total sessions logged`
                  : "Your first session will seed the stats"}
              </p>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden rounded-[1.7rem] bg-black/10 sm:grid-cols-2">
              <StatTile
                label="Time spent"
                value={formatDuration(totalDurationSeconds)}
                detail="Total time staying with sensation"
              />
              <StatTile
                label="Average allowing"
                value={`${averageAllowing}/5`}
                detail="How open the sessions felt overall"
              />
              <StatTile
                label="Relief rate"
                value={`${reliefRate}%`}
                detail="Sessions that ended with some relief"
              />
              <StatTile
                label="Practice days"
                value={String(practiceDays)}
                detail="Unique days with at least one sit"
              />
              <StatTile
                label="Current streak"
                value={`${currentStreak}`}
                detail="Days in a row, counting today if practiced"
              />
              <StatTile
                label="Tracked issues"
                value={String(trackers.issues.length)}
                detail="Ongoing issues tracked outside the session flow"
              />
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-black/10 bg-white/45 p-4 sm:p-5">
              <PracticeGraph
                points={trendData}
                metrics={visibleGraphMetrics}
                activeMetricIds={activeGraphMetrics}
                onToggleMetric={handleToggleGraphMetric}
              />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-black/80">
                  Doorways you use
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Count / Relief / Minutes
                </p>
              </div>

              <div className="space-y-2">
                {methodBreakdown.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-black/10 bg-white/45 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-black/82">
                        {method.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-black/50">
                        {method.count > 0
                          ? `${method.count} session${method.count === 1 ? "" : "s"}`
                          : "Not used yet"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black/78">
                        {method.count > 0
                          ? `${method.reliefRate}% relief`
                          : "--"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-black/50">
                        {method.minutes > 0 ? `${method.minutes} min` : "0 min"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.2rem] border border-black/10 bg-white/45 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-black/80">
                      Consciousness path
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-black/50">
                      Keep a light marker on where you feel you are and what
                      level you want to move toward next.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-black/5 px-3 py-1.5 text-black/65">
                      Current: {currentLevelConfig?.label ?? "Not set"}
                    </span>
                    <span className="rounded-full bg-[rgba(141,90,69,0.12)] px-3 py-1.5 text-[var(--accent)]">
                      Next: {nextLevelConfig?.label ?? "Integrated"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateTrackers("currentLevel", null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      trackers.currentLevel === null
                        ? "bg-[var(--foreground)] text-white"
                        : "border border-black/10 bg-white/55 text-black/70 hover:bg-white/75"
                    }`}
                  >
                    Clear
                  </button>
                  {LEVELS.map((level) => {
                    const isSelected = trackers.currentLevel === level.id;

                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => updateTrackers("currentLevel", level.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? "bg-[var(--foreground)] text-white"
                            : "border border-black/10 bg-white/55 text-black/70 hover:bg-white/75"
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </section>
        ) : null}

        {showCalendarPanel ? (
          <section className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                  Calendar
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                  Trace the days you practiced
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/55">
                  Filter the calendar by relief and click a day to narrow the
                  session list below.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {RELIEF_FILTERS.map((filter) => {
                  const isSelected = reliefFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setReliefFilter(filter.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "bg-[var(--foreground)] text-white"
                          : "border border-black/10 bg-white/45 text-black/70 hover:bg-white/65"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-black/10 bg-white/45 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleShiftMonth(-1)}
                  className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium text-black/75 transition hover:bg-white/80"
                >
                  Prev
                </button>
                <div className="text-center">
                  <p className="text-sm font-medium text-black/80">
                    {formatMonthLabel(selectedMonth)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      startTransition(() => {
                        setSelectedMonth(toMonthStart(new Date()));
                        setSelectedDay(null);
                      });
                    }}
                    className="mt-1 text-xs uppercase tracking-[0.2em] text-black/40"
                  >
                    Jump to current month
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleShiftMonth(1)}
                  className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium text-black/75 transition hover:bg-white/80"
                >
                  Next
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2 text-center">
                {WEEKDAY_LABELS.map((label) => (
                  <p
                    key={label}
                    className="text-xs font-medium uppercase tracking-[0.18em] text-black/35"
                  >
                    {label}
                  </p>
                ))}

                {monthGrid.map((date) => {
                  const dayKey = getDayKey(date);
                  const daySessions = sessionsByDay[dayKey] ?? [];
                  const reliefSessions = daySessions.filter((session) => session.relief)
                    .length;
                  const noReliefSessions = daySessions.length - reliefSessions;
                  const isCurrentMonth =
                    date.getMonth() === selectedMonth.getMonth() &&
                    date.getFullYear() === selectedMonth.getFullYear();
                  const isSelected = selectedDay === dayKey;

                  let background = "rgba(255, 255, 255, 0.5)";
                  let border = "rgba(24, 38, 29, 0.08)";

                  if (daySessions.length > 0 && reliefSessions === daySessions.length) {
                    background = "rgba(76, 111, 87, 0.14)";
                    border = "rgba(76, 111, 87, 0.22)";
                  } else if (
                    daySessions.length > 0 &&
                    noReliefSessions === daySessions.length
                  ) {
                    background = "rgba(155, 111, 64, 0.14)";
                    border = "rgba(155, 111, 64, 0.22)";
                  } else if (daySessions.length > 0) {
                    background = "rgba(141, 90, 69, 0.14)";
                    border = "rgba(141, 90, 69, 0.22)";
                  }

                  if (isSelected) {
                    border = "rgba(24, 38, 29, 0.38)";
                  }

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() =>
                        setSelectedDay((currentDay) =>
                          currentDay === dayKey ? null : dayKey,
                        )
                      }
                      style={{ backgroundColor: background, borderColor: border }}
                      className={`flex min-h-24 flex-col rounded-[1.2rem] border px-2 py-2 text-left transition hover:-translate-y-0.5 hover:bg-white/75 sm:min-h-28 sm:px-3 ${
                        isCurrentMonth ? "opacity-100" : "opacity-45"
                      }`}
                    >
                      <span className="text-sm font-medium text-black/78">
                        {formatDayNumber(date)}
                      </span>
                      <span className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-black/40">
                          {daySessions.length > 0 ? `${daySessions.length}x` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          {reliefSessions > 0 ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                          ) : null}
                          {noReliefSessions > 0 ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                          ) : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {showTrackersPanel ? (
          <section className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                Goal
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                Ongoing patterns
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Keep these updated so they describe your overall issues and accomplisments.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ItemListEditor
              label="Issues I want to let go"
              hint="Track the recurring issues, patterns, and wounds you are actively working with."
              items={trackers.issues}
              onChange={(items) => updateTrackers("issues", items)}
              addLabel="Add issue"
              placeholder="An issue I want to let go of is..."
              emptyText="No issues tracked yet."
            />
            <ItemListEditor
              label="Triggers"
              hint="Track the people, situations, and thoughts that keep activating you."
              items={trackers.triggers}
              onChange={(items) => updateTrackers("triggers", items)}
              addLabel="Add trigger"
              placeholder="A trigger that keeps activating me is..."
              emptyText="No triggers tracked yet."
            />
            <ItemListEditor
              label="Gains from letting go"
              hint="Track what has improved, softened, or opened up through the practice."
              items={trackers.gains}
              onChange={(items) => updateTrackers("gains", items)}
              addLabel="Add gain"
              placeholder="A gain I have noticed is..."
              emptyText="No gains tracked yet."
            />
          </div>
        </section>
        ) : null}

        {showJournalPanel ? (
          <section className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                  Journal
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                  {selectedDay
                    ? `${formatDayHeading(selectedDay)} reflections`
                    : "Daily reflections"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">
                  Write about the day, the feeling that surfaced, how much you
                  allowed it, what patterns you noticed, and how you started
                  versus ended the day. Clicking a day on the calendar filters
                  this journal list too.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-black/5 px-3 py-2 text-sm text-black/60">
                  {selectedDay ? "Filtered by calendar day" : "Showing all days"}
                </span>
                {selectedDay ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="rounded-full border border-black/10 bg-white/45 px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-white/65"
                  >
                    Clear day filter
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[0.94fr_1.06fr]">
              <div
                className={`${journalPanelHeightClass} flex flex-col overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/45 p-5 sm:p-6`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      {journalDraftMode === "edit" ? "Edit journal entry" : "New journal entry"}
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-black/82">
                      Capture the emotional arc of the day
                    </h3>
                  </div>
                  <div className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-black/50">
                    {journalDraft.dayKey}
                  </div>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[rgba(141,90,69,0.12)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                      Question {journalStepIndex + 1} of {JOURNAL_STEPS.length}
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-black/45">
                      {journalDraftMode === "edit"
                        ? "Editing saved reflection"
                        : "One question at a time"}
                    </span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/8">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                      style={{ width: `${journalStepProgress}%` }}
                    />
                  </div>

                  <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.45rem] border border-black/10 bg-[rgba(255,255,255,0.36)] p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
                        Current question
                      </p>
                      <h4 className="mt-3 font-serif text-3xl tracking-[-0.05em] text-black/82">
                        {currentJournalStep.label}
                      </h4>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
                        {currentJournalStep.helper}
                      </p>
                    </div>

                    <div
                      key={currentJournalStep.id}
                      className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1"
                    >
                      {currentJournalStep.kind === "date" ? (
                        <label className="space-y-3">
                          <span className="text-sm font-medium text-black/80">
                            Reflection date
                          </span>
                          <input
                            type="date"
                            value={journalDraft.dayKey}
                            onChange={(event) =>
                              updateJournalDraft("dayKey", event.target.value)
                            }
                            className="w-full rounded-[1.3rem] border border-black/10 bg-white/60 px-4 py-3 text-sm text-black/80 outline-none transition focus:border-[rgba(141,90,69,0.38)] focus:bg-white/80"
                          />
                        </label>
                      ) : currentJournalStep.kind === "input" ? (
                        <label className="space-y-3">
                          <span className="text-sm font-medium text-black/80">
                            Your response
                          </span>
                          <input
                            autoFocus
                            value={journalDraft.feelingThatPoppedUp}
                            onChange={(event) =>
                              updateJournalDraft(
                                "feelingThatPoppedUp",
                                event.target.value,
                              )
                            }
                            placeholder={currentJournalStep.placeholder}
                            className="w-full rounded-[1.3rem] border border-black/10 bg-white/60 px-4 py-3 text-sm text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/80"
                          />
                        </label>
                      ) : currentJournalStep.kind === "allowance" ? (
                        <div className="space-y-3">
                          <span className="text-sm font-medium text-black/80">
                            Choose the closest fit
                          </span>
                          <JournalAllowanceSelector
                            value={journalDraft.allowance}
                            onChange={(value) =>
                              updateJournalDraft("allowance", value)
                            }
                          />
                        </div>
                      ) : (
                        <label className="space-y-3">
                          <span className="text-sm font-medium text-black/80">
                            Your response
                          </span>
                          <textarea
                            autoFocus
                            value={journalDraft[currentJournalStep.id]}
                            onChange={(event) =>
                              updateJournalDraft(
                                currentJournalStep.id,
                                event.target.value,
                              )
                            }
                            rows={8}
                            placeholder={currentJournalStep.placeholder}
                            className="min-h-[16rem] w-full rounded-[1.3rem] border border-black/10 bg-white/60 px-4 py-3 text-sm leading-6 text-black/80 outline-none transition placeholder:text-black/35 focus:border-[rgba(141,90,69,0.38)] focus:bg-white/80"
                          />
                        </label>
                      )}
                    </div>

                    <div className="mt-6 border-t border-black/10 pt-5">
                      <div className="flex flex-col gap-2 text-xs leading-5 text-black/45 sm:flex-row sm:items-center sm:justify-between">
                        <p>
                          Use Previous if you want to revise an earlier answer.
                          Any question can be left blank if it does not fit today.
                        </p>
                        <p>
                          {isLastJournalStep
                            ? "Last question. Save when you are ready."
                            : `Next: ${JOURNAL_STEPS[journalStepIndex + 1]?.label}`}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <button
                          type="button"
                          onClick={handleGoToPreviousJournalStep}
                          disabled={isFirstJournalStep}
                          className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                            isFirstJournalStep
                              ? "cursor-not-allowed border-black/8 bg-black/5 text-black/28"
                              : "border-black/10 bg-white/45 text-black/70 hover:bg-white/65"
                          }`}
                        >
                          Previous question
                        </button>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleCancelJournalEdit}
                            className="rounded-full border border-black/10 bg-white/45 px-5 py-3 text-sm font-medium text-black/70 transition hover:bg-white/65"
                          >
                            {journalDraftMode === "edit" ? "Cancel edit" : "Reset form"}
                          </button>
                          <button
                            type="button"
                            onClick={handleAdvanceJournalStep}
                            disabled={isLastJournalStep && !journalDraftHasContent}
                            className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                              isLastJournalStep && !journalDraftHasContent
                                ? "cursor-not-allowed bg-black/15 text-black/35"
                                : "bg-[var(--foreground)] text-white hover:bg-black/85"
                            }`}
                          >
                            {isLastJournalStep
                              ? journalDraftMode === "edit"
                                ? "Save journal changes"
                                : "Save journal entry"
                              : "Next question"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${journalPanelHeightClass} flex flex-col overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/38`}
              >
                <div className="flex flex-col gap-3 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                      Saved reflections
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/55">
                      {displayedJournalEntries.length} entr
                      {displayedJournalEntries.length === 1 ? "y" : "ies"}
                      {selectedDay ? " match the selected day." : " across your journal."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleJournalList}
                    className="rounded-full border border-black/10 bg-white/50 px-4 py-2 text-sm font-medium text-black/72 transition hover:bg-white/70"
                  >
                    {isJournalListCollapsed ? "Expand reflections" : "Collapse reflections"}
                  </button>
                </div>

                {isJournalListCollapsed ? (
                  <div className="flex flex-1 items-center px-5 py-6 text-sm leading-6 text-black/55">
                    <p>
                      The reflection list is collapsed. Expand it whenever you
                      want to review previous entries.
                    </p>
                  </div>
                ) : displayedJournalEntries.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center px-5 py-10 text-center">
                    <div>
                      <p className="font-serif text-2xl tracking-[-0.03em] text-black/78">
                        No journal entries here yet.
                      </p>
                      <p className="mt-3 text-sm leading-6 text-black/55">
                        Write about the day here, and any calendar day you select
                        will filter the journal list the same way it filters
                        session history.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
                    <div className="space-y-3 pr-1">
                      {displayedJournalEntries.map((entry) => {
                        const isExpanded = expandedJournalEntryIds.includes(entry.id);

                        return (
                          <article
                            key={entry.id}
                            className="rounded-[1.5rem] border border-black/10 bg-white/45 px-5 py-4"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2 text-sm text-black/55">
                                  <span className="rounded-full bg-black/5 px-3 py-1">
                                    {formatDayHeading(entry.dayKey)}
                                  </span>
                                  <span className="rounded-full bg-[rgba(141,90,69,0.14)] px-3 py-1 text-[var(--accent)]">
                                    {JOURNAL_ALLOWANCE_OPTIONS.find(
                                      (option) => option.id === entry.allowance,
                                    )?.label ?? "Partly"} allowed
                                  </span>
                                  <span className="rounded-full bg-black/5 px-3 py-1">
                                    {isExpanded ? "Expanded" : "Collapsed"}
                                  </span>
                                </div>
                                <h3 className="text-lg font-medium text-black/82">
                                  {entry.feelingThatPoppedUp || "Daily reflection"}
                                </h3>
                                <p className="text-sm leading-6 text-black/55">
                                  Updated {formatSessionTimestamp(entry.updatedAt)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleToggleJournalEntry(entry.id)}
                                  aria-expanded={isExpanded}
                                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    isExpanded
                                      ? "border-[rgba(141,90,69,0.28)] bg-[rgba(141,90,69,0.14)] text-[var(--accent)] hover:bg-[rgba(141,90,69,0.2)]"
                                      : "border-black/10 bg-white/50 text-black/70 hover:bg-white/70"
                                  }`}
                                >
                                  {isExpanded ? "Hide reflection" : "Open reflection"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditJournalEntry(entry)}
                                  className="rounded-full border border-black/10 bg-white/50 px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-white/70"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteJournalEntry(entry)}
                                  className="rounded-full border border-[rgba(155,111,64,0.22)] bg-[rgba(155,111,64,0.12)] px-4 py-2 text-sm font-medium text-[var(--warning)] transition hover:bg-[rgba(155,111,64,0.18)]"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {isExpanded ? (
                              <div className="mt-4 grid gap-3">
                                <JournalEntryBlock
                                  label="Write about your day"
                                  value={entry.daySummary}
                                />
                                <JournalEntryBlock
                                  label="What could you have done differently?"
                                  value={entry.differentChoice}
                                />
                                <JournalEntryBlock
                                  label="What patterns did you recognize?"
                                  value={entry.recognizedPatterns}
                                />
                                <JournalEntryBlock
                                  label="What happened?"
                                  value={entry.whatHappened}
                                />
                                <JournalEntryBlock
                                  label="What did you want to happen?"
                                  value={entry.whatWantedToHappen}
                                />
                                <JournalEntryBlock
                                  label="How did the difference make you feel?"
                                  value={entry.differenceFeeling}
                                />
                                {entry.startOfDayFeeling || entry.endOfDayFeeling ? (
                                  <JournalEntryBlock
                                    label="How you started vs ended the day"
                                    value={`Start: ${entry.startOfDayFeeling}\nEnd: ${entry.endOfDayFeeling}`}
                                    preserveLines
                                  />
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-4 rounded-[1.2rem] border border-black/10 bg-white/35 px-4 py-4">
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                                  Preview
                                </p>
                                <p className="mt-3 text-sm leading-6 text-black/62">
                                  {getJournalEntryPreview(entry)}
                                </p>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {showHistoryPanel ? (
          <section className="panel-surface rounded-[2rem] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/40">
                Session history
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em]">
                {selectedDay ? formatDayHeading(selectedDay) : "All logged sessions"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/55">
                {displayedSessions.length > 0
                  ? `${displayedSessions.length} session${displayedSessions.length === 1 ? "" : "s"} match the current filter.`
                  : "No sessions match the current calendar and relief filter."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-black/5 px-3 py-2 text-sm text-black/60">
                {RELIEF_FILTERS.find((filter) => filter.id === reliefFilter)?.label}
              </span>
              {historyLocked ? (
                <span className="rounded-full border border-black/10 bg-white/45 px-3 py-2 text-sm text-black/60">
                  Finish the current session or edit before changing history
                </span>
              ) : null}
              {selectedDay ? (
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="rounded-full border border-black/10 bg-white/45 px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-white/65"
                >
                  Clear day filter
                </button>
              ) : null}
            </div>
          </div>

          {displayedSessions.length === 0 ? (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-black/10 bg-white/35 px-5 py-10 text-center">
              <p className="font-serif text-2xl tracking-[-0.03em] text-black/78">
                No sessions here yet.
              </p>
              <p className="mt-3 text-sm leading-6 text-black/55">
                Start a sit, finish the reflection, and this timeline will begin
                to fill in.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {displayedSessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-[1.5rem] border border-black/10 bg-white/45 px-5 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-sm text-black/55">
                        <span className="rounded-full bg-black/5 px-3 py-1">
                          {getMethodConfig(session.method).label}
                        </span>
                        <span className="rounded-full bg-black/5 px-3 py-1">
                          {formatDuration(session.durationSeconds)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 ${
                            session.relief
                              ? "bg-[rgba(76,111,87,0.14)] text-[var(--success)]"
                              : "bg-[rgba(155,111,64,0.14)] text-[var(--warning)]"
                          }`}
                        >
                          {session.relief ? "Relief" : "No relief"}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-black/82">
                        {session.feelingLabel || "Unlabeled sensation"}
                      </h3>
                      <p className="text-sm leading-6 text-black/55">
                        {formatSessionTimestamp(session.startedAt)} - Allowing{" "}
                        {session.allowingRating}/5
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-sm text-black/60">
                        {getDayKey(session.startedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditSession(session)}
                        disabled={historyLocked}
                        className="rounded-full border border-black/10 bg-white/50 px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session)}
                        disabled={historyLocked}
                        className="rounded-full border border-[rgba(155,111,64,0.22)] bg-[rgba(155,111,64,0.12)] px-4 py-2 text-sm font-medium text-[var(--warning)] transition hover:bg-[rgba(155,111,64,0.18)] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <SessionListBlock
                      title={getMethodConfig(session.method).itemLabel}
                      items={session.methodItems}
                    />
                  </div>

                  {session.prepNote ? (
                    <p className="mt-4 text-sm leading-6 text-black/63">
                      <span className="font-medium text-black/75">Entry:</span>{" "}
                      {session.prepNote}
                    </p>
                  ) : null}

                  {session.closingNote ? (
                    <p className="mt-3 text-sm leading-6 text-black/63">
                      <span className="font-medium text-black/75">Close:</span>{" "}
                      {session.closingNote}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
        ) : null}
      </main>

    </div>
  );
}

function QuickMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/35">
        {label}
      </p>
      <p className="mt-2 text-lg font-medium text-black/80">{value}</p>
    </div>
  );
}

function PracticeCue({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-black/10 bg-white/45 px-4 py-4">
      <p className="text-sm font-medium text-black/82">{title}</p>
      <p className="mt-2 text-sm leading-6 text-black/55">{body}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white/45 px-4 py-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/35">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl tracking-[-0.04em] text-black/82">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-black/55">{detail}</p>
    </div>
  );
}

function JournalAllowanceSelector({
  value,
  onChange,
}: {
  value: JournalAllowance;
  onChange: (value: JournalAllowance) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {JOURNAL_ALLOWANCE_OPTIONS.map((option) => {
        const isSelected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
              isSelected
                ? "border-[rgba(141,90,69,0.38)] bg-[rgba(141,90,69,0.14)]"
                : "border-black/10 bg-white/45 hover:bg-white/65"
            }`}
          >
            <p className="text-sm font-medium text-black/85">{option.label}</p>
            <p className="mt-2 text-xs leading-5 text-black/55">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function JournalEntryBlock({
  label,
  value,
  preserveLines = false,
}: {
  label: string;
  value: string;
  preserveLines?: boolean;
}) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div className="rounded-[1.2rem] border border-black/10 bg-white/40 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
        {label}
      </p>
      <p
        className={`mt-3 text-sm leading-6 text-black/68 ${
          preserveLines ? "whitespace-pre-line" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PracticeGraph({
  points,
  metrics,
  activeMetricIds,
  onToggleMetric,
}: {
  points: TrendPoint[];
  metrics: GraphMetricConfig[];
  activeMetricIds: GraphMetricId[];
  onToggleMetric: (metricId: GraphMetricId) => void;
}) {
  const chartWidth = 960;
  const chartHeight = 280;
  const padding = { top: 20, right: 18, bottom: 36, left: 18 };
  const drawableWidth = chartWidth - padding.left - padding.right;
  const drawableHeight = chartHeight - padding.top - padding.bottom;
  const hasPracticeData = points.some((point) => point.sessions > 0);
  const isRelativeScale = metrics.length > 1;
  const lastPoint = points[points.length - 1] ?? null;
  const [hoveredMetricId, setHoveredMetricId] = useState<GraphMetricId | null>(null);
  const [hoveredDatum, setHoveredDatum] = useState<{
    metricId: GraphMetricId;
    metricLabel: string;
    metricColor: string;
    pointLabel: string;
    value: number;
    x: number;
    y: number;
    formattedValue: string;
  } | null>(null);
  const metricMaxById = Object.fromEntries(
    GRAPH_METRICS.map((metric) => [
      metric.id,
      Math.max(
        1,
        ...points.map((point) => Math.max(0, getGraphMetricValue(point, metric.id))),
      ),
    ]),
  ) as Record<GraphMetricId, number>;
  const singleMetric = metrics.length === 1 ? metrics[0] : null;
  const singleMetricMax = singleMetric ? metricMaxById[singleMetric.id] : 1;
  const axisLabels = singleMetric
    ? [
        singleMetric.formatValue(0),
        singleMetric.formatValue(singleMetricMax / 2),
        singleMetric.formatValue(singleMetricMax),
      ]
    : ["0%", "50%", "100%"];
  const xLabelIndexes = Array.from(
    new Set([
      0,
      Math.max(0, Math.floor((points.length - 1) / 3)),
      Math.max(0, Math.floor(((points.length - 1) * 2) / 3)),
      Math.max(0, points.length - 1),
    ]),
  );
  const series = metrics.map((metric) => {
    const divisor = isRelativeScale ? metricMaxById[metric.id] : singleMetricMax;
    const coordinates = points.map((point, index) => {
      const x =
        points.length === 1
          ? padding.left + drawableWidth / 2
          : padding.left + (index / (points.length - 1)) * drawableWidth;
      const value = getGraphMetricValue(point, metric.id);
      const scaledValue = divisor > 0 ? value / divisor : 0;
      const y = padding.top + (1 - scaledValue) * drawableHeight;

      return {
        x,
        y,
        value,
        label: point.label,
      };
    });

    return {
      metric,
      coordinates,
      path: coordinates
        .map((coordinate, index) =>
          `${index === 0 ? "M" : "L"} ${coordinate.x} ${coordinate.y}`,
        )
        .join(" "),
    };
  });
  const tooltipWidth = 160;
  const tooltipX = hoveredDatum
    ? Math.max(
        padding.left,
        Math.min(chartWidth - tooltipWidth - padding.right, hoveredDatum.x + 14),
      )
    : 0;
  const tooltipY = hoveredDatum
    ? Math.max(padding.top + 6, Math.min(chartHeight - 72, hoveredDatum.y - 58))
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
            Practice graph
          </p>
          <h3 className="mt-2 text-lg font-medium text-black/82">
            Compare the recent stats
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
            Toggle the lines to compare sessions, minutes, allowing, and relief
            across the last {points.length} days.
            {isRelativeScale
              ? " When multiple lines are on, each one scales to its own range so the movement is easier to compare."
              : " With one line selected, the graph switches to that metric's actual daily values."}
            {" Hover a line to see which stat it is."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {GRAPH_METRICS.map((metric) => {
            const isSelected = activeMetricIds.includes(metric.id);

            return (
              <button
                key={metric.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleMetric(metric.id)}
                style={
                  isSelected
                    ? {
                        borderColor: hexToRgba(metric.color, 0.45),
                        backgroundColor: hexToRgba(metric.color, 0.16),
                        color: metric.color,
                        boxShadow: `0 10px 24px ${hexToRgba(metric.color, 0.12)}`,
                      }
                    : undefined
                }
                className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "bg-white/80"
                    : "border-black/10 bg-white/22 text-black/48 hover:bg-white/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSelected ? "" : "opacity-55"
                    }`}
                    style={{ backgroundColor: metric.color }}
                  />
                  {metric.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      isSelected ? "bg-black/7" : "bg-black/5 text-black/38"
                    }`}
                  >
                    {isSelected ? "On" : "Off"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="rounded-[1.35rem] border border-dashed border-black/10 bg-white/35 px-5 py-8 text-center">
          <p className="font-medium text-black/75">No lines selected.</p>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Turn on at least one stat above to draw the graph.
          </p>
        </div>
      ) : !hasPracticeData ? (
        <div className="rounded-[1.35rem] border border-dashed border-black/10 bg-white/35 px-5 py-8 text-center">
          <p className="font-medium text-black/75">No trend data yet.</p>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Log a few sessions and this graph will begin charting the recent flow.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                style={
                  hoveredMetricId === metric.id
                    ? {
                        borderColor: hexToRgba(metric.color, 0.4),
                        backgroundColor: hexToRgba(metric.color, 0.1),
                      }
                    : undefined
                }
                className="rounded-[1.15rem] border border-black/10 bg-white/38 px-4 py-3 transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                  <p className="text-sm font-medium text-black/80">{metric.label}</p>
                </div>
                <p className="mt-3 text-lg font-medium text-black/82">
                  {lastPoint ? metric.formatValue(getGraphMetricValue(lastPoint, metric.id)) : "--"}
                </p>
                <p className="mt-1 text-xs leading-5 text-black/50">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          <div
            className="overflow-hidden rounded-[1.45rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.28))] px-3 py-4 sm:px-4"
            onMouseLeave={() => {
              setHoveredMetricId(null);
              setHoveredDatum(null);
            }}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-72 w-full"
              role="img"
              aria-label="Daily practice trend graph"
            >
              {[0, 0.5, 1].map((tick, index) => {
                const y = padding.top + (1 - tick) * drawableHeight;

                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      x2={chartWidth - padding.right}
                      y1={y}
                      y2={y}
                      stroke="rgba(24, 38, 29, 0.12)"
                      strokeDasharray={index === 2 ? "0" : "6 8"}
                    />
                    <text
                      x={chartWidth - padding.right}
                      y={y - 6}
                      textAnchor="end"
                      fontSize="11"
                      fill="rgba(24, 38, 29, 0.42)"
                    >
                      {axisLabels[index]}
                    </text>
                  </g>
                );
              })}

              {xLabelIndexes.map((index) => {
                const point = points[index];
                const x =
                  points.length === 1
                    ? padding.left + drawableWidth / 2
                    : padding.left + (index / (points.length - 1)) * drawableWidth;

                return (
                  <text
                    key={point.dayKey}
                    x={x}
                    y={chartHeight - 8}
                    textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                    fontSize="11"
                    fill="rgba(24, 38, 29, 0.46)"
                  >
                    {point.label}
                  </text>
                );
              })}

              {series.map((entry) => {
                const isHovered = hoveredMetricId === entry.metric.id;
                const shouldDim =
                  hoveredMetricId !== null && hoveredMetricId !== entry.metric.id;

                return (
                  <g key={entry.metric.id}>
                    <path
                      d={entry.path}
                      fill="none"
                      stroke={entry.metric.color}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isHovered ? "4.5" : "3"}
                      opacity={shouldDim ? 0.18 : 1}
                    />
                    <path
                      d={entry.path}
                      fill="none"
                      stroke="transparent"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="18"
                      style={{ pointerEvents: "stroke" }}
                      onPointerEnter={() => setHoveredMetricId(entry.metric.id)}
                      onPointerMove={(event) => {
                        const svg = event.currentTarget.ownerSVGElement;

                        if (!svg) {
                          return;
                        }

                        const rect = svg.getBoundingClientRect();
                        const ratio =
                          rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
                        const svgX = ratio * chartWidth;
                        const rawIndex =
                          points.length === 1
                            ? 0
                            : Math.round(
                                ((svgX - padding.left) / drawableWidth) *
                                  (points.length - 1),
                              );
                        const safeIndex = Math.max(
                          0,
                          Math.min(points.length - 1, rawIndex),
                        );
                        const coordinate = entry.coordinates[safeIndex];
                        const point = points[safeIndex];

                        if (!coordinate || !point) {
                          return;
                        }

                        setHoveredMetricId(entry.metric.id);
                        setHoveredDatum({
                          metricId: entry.metric.id,
                          metricLabel: entry.metric.label,
                          metricColor: entry.metric.color,
                          pointLabel: point.label,
                          value: coordinate.value,
                          x: coordinate.x,
                          y: coordinate.y,
                          formattedValue: entry.metric.formatValue(coordinate.value),
                        });
                      }}
                      onPointerLeave={() => {
                        setHoveredMetricId(null);
                        setHoveredDatum(null);
                      }}
                    />
                    {entry.coordinates.map((coordinate, index) => (
                      <circle
                        key={`${entry.metric.id}-${points[index]?.dayKey ?? index}`}
                        cx={coordinate.x}
                        cy={coordinate.y}
                        r={isHovered && index === entry.coordinates.length - 1 ? 5 : index === entry.coordinates.length - 1 ? 4.2 : 2.4}
                        fill={entry.metric.color}
                        opacity={shouldDim ? 0.24 : index === entry.coordinates.length - 1 ? 1 : 0.82}
                      />
                    ))}
                  </g>
                );
              })}

              {hoveredDatum ? (
                <g pointerEvents="none">
                  <circle
                    cx={hoveredDatum.x}
                    cy={hoveredDatum.y}
                    r="6"
                    fill={hoveredDatum.metricColor}
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="2"
                  />
                  <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                    <rect
                      width={tooltipWidth}
                      height="58"
                      rx="14"
                      fill="rgba(17, 24, 20, 0.92)"
                    />
                    <text x="14" y="20" fontSize="11" fill="rgba(255,255,255,0.68)">
                      {hoveredDatum.pointLabel}
                    </text>
                    <circle
                      cx="16"
                      cy="38"
                      r="4"
                      fill={hoveredDatum.metricColor}
                    />
                    <text x="28" y="36" fontSize="13" fill="rgba(255,255,255,0.96)">
                      {hoveredDatum.metricLabel}
                    </text>
                    <text x="28" y="51" fontSize="12" fill="rgba(255,255,255,0.76)">
                      {hoveredDatum.formattedValue}
                    </text>
                  </g>
                </g>
              ) : null}
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function MethodSelector({
  value,
  onChange,
}: {
  value: BringUpMethod;
  onChange: (value: BringUpMethod) => void;
}) {
  return (
    <div className="grid gap-3">
      {METHODS.map((method) => {
        const isSelected = method.id === value;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
              isSelected
                ? "border-[rgba(141,90,69,0.38)] bg-[rgba(141,90,69,0.14)]"
                : "border-black/10 bg-white/45 hover:bg-white/65"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-black/85">{method.label}</p>
              <span className="text-xs uppercase tracking-[0.2em] text-black/35">
                {method.shortLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-black/60">
              {method.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function RatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {RATING_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[1.3rem] border px-3 py-4 text-left transition ${
              isSelected
                ? "border-[rgba(141,90,69,0.38)] bg-[rgba(141,90,69,0.14)]"
                : "border-black/10 bg-white/45 hover:bg-white/65"
            }`}
          >
            <p className="text-sm font-medium text-black/85">
              {option.value}. {option.label}
            </p>
            <p className="mt-2 text-xs leading-5 text-black/55">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function ReliefSelector({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
          value
            ? "border-[rgba(76,111,87,0.34)] bg-[rgba(76,111,87,0.14)]"
            : "border-black/10 bg-white/45 hover:bg-white/65"
        }`}
      >
        <p className="text-sm font-medium text-black/85">Yes, something eased</p>
        <p className="mt-2 text-xs leading-5 text-black/55">
          The sensation softened, opened, or felt less charged at the end.
        </p>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
          !value
            ? "border-[rgba(155,111,64,0.34)] bg-[rgba(155,111,64,0.14)]"
            : "border-black/10 bg-white/45 hover:bg-white/65"
        }`}
      >
        <p className="text-sm font-medium text-black/85">
          No, it still felt active
        </p>
        <p className="mt-2 text-xs leading-5 text-black/55">
          The session still counts. You stayed long enough to see what remains.
        </p>
      </button>
    </div>
  );
}

function ItemListEditor({
  label,
  hint,
  items,
  onChange,
  addLabel,
  placeholder,
  emptyText,
}: {
  label: string;
  hint: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
  emptyText: string;
}) {
  function updateItem(index: number, nextValue: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/45 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-black/82">{label}</p>
          <p className="mt-2 text-sm leading-6 text-black/55">{hint}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-full border border-black/10 bg-white/55 px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-white/75"
        >
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[1.2rem] border border-dashed border-black/10 bg-white/30 px-4 py-6 text-sm leading-6 text-black/50">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${label}-${index}`}
              className="flex items-start gap-3 rounded-[1.2rem] border border-black/10 bg-white/50 px-3 py-3"
            >
              <span className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-black/35">
                {index + 1}
              </span>
              <input
                value={item}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm leading-6 text-black/80 outline-none placeholder:text-black/35"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-black/55 transition hover:bg-white/80"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionListBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.2rem] border border-black/10 bg-white/40 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-black/68">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
