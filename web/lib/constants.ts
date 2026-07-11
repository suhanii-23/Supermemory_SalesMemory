export const NAV_LINKS = [
  { label: "Features", href: "#why", external: false },
  { label: "How it Works", href: "#how-it-works", external: false },
  { label: "Dashboard", href: "#briefing", external: false },
  { label: "Privacy", href: "#privacy", external: false },
  {
    label: "GitHub",
    href: "https://github.com/suhanii-23/Supermemory_SalesMemory",
    external: true,
  },
] as const;

export const HERO_FEATURE_CARDS = [
  {
    icon: "🧠",
    title: "Relationship Memory",
    description: "Never lose context again.",
  },
  {
    icon: "💬",
    title: "Meeting Intelligence",
    description: "Know exactly what happened.",
  },
  {
    icon: "🔒",
    title: "Local First",
    description: "100% private. Powered by Supermemory.",
  },
] as const;

// 8 texts per spec -- cycled through 5 floating bubble slots around the
// hero mockup, each slot showing a different rotating offset.
export const NOTIFICATION_TEXTS = [
  "Meeting summarized",
  "Email sentiment changed",
  "Buying signal detected",
  "Client opened proposal",
  "New Slack conversation indexed",
  "Next best action generated",
  "Relationship score ↑",
  "Follow-up due tomorrow",
] as const;

export const TRUST_LOGOS = [
  "Northwind",
  "Vertex Labs",
  "Alta",
  "Meridian",
  "Cobalt",
] as const;

export const PROCESS_STEPS = [
  {
    title: "Capture",
    items: ["Emails", "Calls", "Slack", "Meeting notes", "CRM updates"],
  },
  { title: "Supermemory connects everything" },
  { title: "Living relationship memory" },
  { title: "AI prepares you before every meeting" },
] as const;

export const METRICS = [
  { label: "Current Clients", value: 24, suffix: "" },
  { label: "Meetings Indexed", value: 312, suffix: "" },
  { label: "Emails Remembered", value: 4890, suffix: "" },
  { label: "Memory Accuracy", value: 98, suffix: "%" },
  { label: "Relationship Profiles", value: 24, suffix: "" },
] as const;

export const BRIEFING_MOCK = {
  clientName: "Sarah Johnson",
  relationshipHealth: 92,
  lastMeeting: "4 days ago",
  mood: "Positive",
  buyingSignals: 5,
  topics: ["Expansion plans", "Budget approval", "Hiring"],
  talkingPoints: [
    "Ask about new hiring",
    "Mention onboarding",
    "Follow up on pricing",
  ],
  avoid: ["Bringing up delayed invoice"],
  nextBestAction: "Send implementation timeline after meeting.",
} as const;

export const HISTORY_TIMELINE = [
  { date: "January", title: "First cold email" },
  { date: "February", title: "Discovery Call" },
  { date: "March", title: "Proposal sent" },
  { date: "April", title: "Pricing discussion" },
  { date: "May", title: "Expansion conversation" },
  { date: "Today", title: "Preparing meeting using all previous context" },
] as const;

// icon names resolved against lucide-react in WhySaleSightsSection
export const WHY_FEATURES = [
  {
    icon: "BrainCircuit",
    title: "Relationship Intelligence",
    description: "Understands the full arc of every client relationship.",
  },
  {
    icon: "Sparkles",
    title: "Context-Aware Briefings",
    description: "Every meeting starts with the full picture, automatically.",
  },
  {
    icon: "ShieldCheck",
    title: "Private by Design",
    description: "Your client data stays yours — always.",
  },
  {
    icon: "Laptop",
    title: "Runs Locally",
    description: "No cloud dependency. Everything happens on your machine.",
  },
  {
    icon: "Zap",
    title: "Supermemory Powered",
    description: "Built on a memory engine designed for real relationships.",
  },
  {
    icon: "Search",
    title: "Instant Search",
    description: "Find any conversation, quote, or moment in seconds.",
  },
] as const;
