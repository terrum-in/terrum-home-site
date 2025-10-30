import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

export interface Event {
  id: number;
  event_uuid: string;
  name: string;
  description: SerializedEditorState<SerializedLexicalNode>; // unchanged

  image: {
    alt: string;
    presigned_url: string;
  };

  // New location metadata from JSON
  region: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  neighbourhood: string | null;

  venue: string | null;

  google_maps_link: string | null;

  // Links (renamed/added to match JSON)
  external_event_link: string | null;
  payment_link: string | null;
  meeting_link: string | null;

  // Dates & times (ISO strings in JSON)
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;

  is_hosted_by_terrum: boolean;
  deleted: boolean;
  is_online: boolean;
  is_online_and_offline: boolean;

  // WKB hex string or other shapes
  location: string | Record<string, any>;

  // Pricing (strings in JSON)
  price: string;
  early_bird_price: string;
  early_bird_end_date: string;

  form: number;

  agenda_blocks: Array<{
    order: number;
    parent: number;
    path: string;
    id: string;
    time: string;
    title: string;
    speaker: string;
    description: string;
    block_name: string | null;
  }>;
}
