import type {
  AddInteractionRequest,
  AddInteractionResponse,
  ApiError,
  Brief,
  Deal,
} from "../types/brief";
import { mockBrief } from "../data/mockBrief";
import { mockBriefEmpty } from "../data/mockBriefEmpty";
import { mockDeals } from "../data/mockDeals";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export class BriefFetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BriefFetchError";
    this.status = status;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchDeals(): Promise<Deal[]> {
  if (USE_MOCK) {
    await delay(300);
    return mockDeals;
  }
  const res = await fetch(`${API_BASE}/api/deals`);
  if (!res.ok) {
    throw new BriefFetchError("Failed to load deals", res.status);
  }
  return res.json();
}

export async function fetchBrief(
  deal: string,
  context: string,
  force = false,
): Promise<Brief> {
  if (USE_MOCK) {
    await delay(force ? 1400 : 500);
    // "empty" deal is a mock-only fixture id for exercising every card's
    // empty state without needing a real thin-data deal.
    return deal === "deal-mock-empty" ? mockBriefEmpty : mockBrief;
  }

  const params = new URLSearchParams({ deal, context, force: String(force) });
  const res = await fetch(`${API_BASE}/api/brief?${params.toString()}`);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new BriefFetchError(
      body?.error ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return res.json();
}

export async function addInteraction(
  containerTag: string,
  body: AddInteractionRequest,
): Promise<AddInteractionResponse> {
  if (USE_MOCK) {
    await delay(600);
    return { documentId: "mock-doc-id", status: "queued" };
  }

  const res = await fetch(`${API_BASE}/api/deals/${containerTag}/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as ApiError | null;
    throw new BriefFetchError(
      errBody?.error ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return res.json();
}

export function meetingContextFor(deal: Deal): string {
  return `Upcoming meeting with ${deal.champion}, ${deal.role} at ${deal.account}`;
}
