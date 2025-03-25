export interface Event {
  id: number;
  name: string;
  description: {
    root: {
      type: string;
      format: string;
      indent: number;
      version: number;
      children: Array<any>; // Complex nested structure for rich text
      direction: string;
      textFormat: number;
    };
  };
  image: {
    alt: string;
    presigned_url: string;
  };
  venue: string | null;
  city: string | null;
  locality: string | null;
  google_maps_link: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  deleted: boolean;
  is_online: boolean;
  is_online_and_offline: boolean; // New field
  location: string | Record<string, any>; // Changed type to accept string format found in JSON
  google_form_link: string | null;
  payment_link: string | null;
  price: number; // New field
  event_uuid: string;
  form: number; // New field
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
  }>; // New field
  early_bird_end_date: string;
  early_bird_price: number; // New field
}
