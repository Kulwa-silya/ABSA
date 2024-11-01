// --- frontend/src/types/form.ts ---
// These are our frontend form types (moved from original types.ts)

export interface AspectEntry {
  id: string;
  aspect: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface Comment {
  id: string;
  text: string;
  aspects: AspectEntry[];
  generalSentiment: "positive" | "negative" | "neutral";
}

export interface FormData {
  postCaption: string;
  source: string;
  comments: Comment[];
}
