# Events Module Documentation

This document explains the complete Events flow in this app: routes, components, data flow, API calls, and all user interactions including registration and payments — updated to match the current code.

## Routes at a glance

- `/events`
  - Server Component page that lists upcoming events.
  - Data source: GET `${NEXT_PUBLIC_BASE_API_URL}/cms/events/` (with `cache: 'no-store'`)
- `/events/[eventId]`
  - Server Component page that shows details for a specific event by its `event_uuid`.
  - Data source: GET `${NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid={eventId}`
  - Generates SEO metadata (OpenGraph/Twitter) from event details using `lexicalJsonToPlainText(...)` and truncates description to ~300 chars. Includes OG image when available.
- `/events/[eventId]/[formId]`
  - Client Component page that renders the dynamic registration form tied to the event.
  - Data sources:
    - GET `${NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid={eventId}`
    - GET `${NEXT_PUBLIC_CMS_API_URL}/api/forms/{formId}`
  - On submit:
    - POST `${NEXT_PUBLIC_CMS_API_URL}/api/form-submissions`
    - If paid event: creates a Razorpay order then captures payment via backend endpoints
      - POST `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/order/`
      - POST `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/capture/`

Loading states are handled by route-level `loading.tsx` files under `/events` and `/events/[eventId]`.

---

## Key files and responsibilities

- `app/events/page.tsx`
  - Fetches all events with `cache: 'no-store'` to avoid stale lists during development.
  - Renders a grid of Event Cards. Each card links to `/events/{event.event_uuid}`.
  - Uses helpers to format dates and times.
- `app/events/[eventId]/page.tsx`
  - Fetches a single event by `event_uuid`.
  - Builds SEO metadata with title, description (derived from Lexical JSON), OpenGraph image, etc.
  - Renders `EventDetails` and a primary Register button:
    - If `event.form` is present and > 0: links to `/events/{event_uuid}/{event.form}`.
    - Else if `event.external_event_link` is present: links out to that external registration URL.
    - Else: shows "Registrations opening soon".
- `app/events/[eventId]/[formId]/page.tsx`
  - Client-side page that:
    - Concurrently fetches the event and the form JSON.
    - Shows `LoadingScreen` and error states.
    - Renders `DynamicForm` with pricing and an `onConfirmation` callback to show a confirmation screen.
    - Displays `EventRegistrationConfirmation` with an optional WhatsApp redirect button.
- `components/events/event-details.tsx`
  - Displays banner, basic info, schedule (`agenda_blocks`), description rendered from Lexical content.
  - Shows "Register Now" button to the form route.
- `components/dynamic-form.tsx`
  - Renders a form driven entirely by JSON (`FormData`).
  - On submit, creates a form submission via `${NEXT_PUBLIC_CMS_API_URL}/api/form-submissions`.
  - If the event price is non-zero (checks `price !== "0.00"`), initiates Razorpay checkout:
    - Creates order via backend `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/order/`.
    - Opens Razorpay widget using `NEXT_PUBLIC_RAZORPAY_KEY_ID` (via `window.Razorpay`).
    - On success, posts to `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/capture/`.
    - Calls the provided `onConfirmation` callback to render confirmation UI.
- `components/events/event-registration-confirmation.tsx`
  - Simple confirmation view with optional WhatsApp CTA and a link back to `/events`.
- `components/events/events-header.tsx`
  - Minimal header/navigation component reused across pages.

---

## Data models and helpers

### Event

Defined in `types/cms-event.ts` and returned by the CMS endpoints.

Important fields used in UI and flow:

- `id: number` — numeric event ID (used for payment payloads)
- `event_uuid: string` — used in URL paths and to fetch by `?event_uuid=`
- `name: string`
- `description: Lexical JSON (SerializedEditorState)` — plain text for SEO via `lexicalJsonToPlainText`; rendered via `<RichText converters={jsxConverters} />` in the body
- `image: { alt: string; presigned_url: string }`
- Location: `venue, city, state` (strings or null) and optional `google_maps_link`
- `is_hosted_by_terrum: boolean` — tags the event as hosted by Terrum
- `is_online: boolean` and `is_online_and_offline: boolean`
- `start_date, end_date: string`
- `start_time, end_time: string`
- `agenda_blocks: { id, time, title, description, speaker, ... }[]`
- `form: number` — the ID of the form to render on the registration route
- `external_event_link: string | null` — optional external registration URL when no internal form is available
- `price: string` — event price as a string (e.g., "0.00")
- `early_bird_price: string` and `early_bird_end_date: string` — displayed on the details page

Formatting/helpers used:

- `formatDateRange(start_date, end_date)` — listing and details
- `formatTime(start_time)` — listing and details
- `lexicalJsonToPlainText()` — produces meta description text (for SEO)
- `jsxConverters` — custom renderers for Lexical content in `<RichText />`

### FormData (dynamic forms)

Defined in `types/lexical-content.ts`.

- `id: number`
- `title: string`
- `fields: FormField[]` — supported block types: `text`, `number`, `email`, `select`, `checkbox`, `textarea`, `message`
- `submitButtonLabel: string`
- `redirect?: { url: string }` — optionally used for post-submit redirection/CTA

Form field rendering behavior:

- `message` blocks render read-only rich text instructions using `<RichText converters={jsxConverters} />`.
- `select` uses `options` for choices.
- `checkbox` maps boolean values.
- All other `blockType` values map to `<input type={blockType}>`.

### FormSubmissionResponse

Defined in `types/payload-cms/form-submission.ts`.

- Includes `doc.form.confirmationType` which controls post-submit behavior:
  - `"message"` — show a thank-you message
  - `"redirect"` — show a WhatsApp CTA; open provided URL in a new tab
- May include `confirmationMessage` and `redirect.url` used by the UI.

---

## End-to-end data flow

### 1) Viewing the Events list (`/events`)

1. Server fetch to `${NEXT_PUBLIC_BASE_API_URL}/cms/events/` with `cache: 'no-store'`.
2. Render grid of cards with banner image, venue/city, date/time.
3. Each card links to `/events/{event_uuid}`.

### 2) Viewing Event details (`/events/[eventId]`)

1. Server fetch to `${NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid={eventId}`.
2. Generate SEO metadata (title, description from Lexical JSON via `lexicalJsonToPlainText`, OG image if present, Twitter card).
3. Render banner, schedule (`agenda_blocks`), description, and a Register button.
4. Register button goes to `/events/{event_uuid}/{form}`.

### 3) Registering for an Event (`/events/[eventId]/[formId]`)

1. Client loads and concurrently fetches:

- Event via `${NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid={eventId}`
- Form JSON via `${NEXT_PUBLIC_CMS_API_URL}/api/forms/{formId}`

2. Shows `LoadingScreen` while fetching; shows an error if fetch fails.
3. Renders `DynamicForm` with `form`, `price`, `earlyBirdPrice`, `eventId`.

#### 3.a) Submitting the form (free event `price === 0`)

1. On submit, assemble `submissionData` from input values.
2. POST to `${NEXT_PUBLIC_CMS_API_URL}/api/form-submissions` with `{ form: form.id, submissionData }`.
3. Inspect `result.doc.form.confirmationType`:
   - If `message`: show thank-you text (from `confirmationMessage` if present).
   - If `redirect`: show CTA to join WhatsApp using `redirect.url`.

#### 3.b) Submitting the form (paid event `price !== 0`)

1. Submit form as in 3.a to get a `formSubmissionId`.
2. POST to `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/order/` with `{ amount, currency: 'INR', form_submission_id, event_id, form_id }`.
3. Initialize Razorpay Checkout using `NEXT_PUBLIC_RAZORPAY_KEY_ID` and the returned `order.id`.
4. On successful payment in the Razorpay handler:

- POST to `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/capture/` with `{ razorpay_payment_id, razorpay_order_id }`.
- On success, show confirmation UI using the same `confirmationType/message/redirect` logic as free events.

---

## API endpoints summary

External CMS/API (configured via env vars):

- GET `${NEXT_PUBLIC_BASE_API_URL}/cms/events/`
  - Returns: `Event[]`
- GET `${NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid={event_uuid}`
  - Returns: `Event`
- POST `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/order/`
  - Body: `{ amount: number, currency: 'INR', form_submission_id?: number, event_id: number, form_id: number }`
  - Returns: Razorpay order payload `{ id, amount, currency, ... }`
- POST `${NEXT_PUBLIC_BASE_API_URL}/cms/payment/capture/`
  - Body: `{ razorpay_payment_id: string, razorpay_order_id: string }`
  - Returns: capture result (implementation-specific)

Payload CMS endpoints (configured via `NEXT_PUBLIC_CMS_API_URL`):

- GET `${NEXT_PUBLIC_CMS_API_URL}/api/forms/{formId}`
  - Returns: `FormData`
- POST `${NEXT_PUBLIC_CMS_API_URL}/api/form-submissions`
  - Body: `{ form: number, submissionData: { field: string, value: string | boolean }[] }`
  - Returns: `FormSubmissionResponse`

Notes:

- The internal routes above are referenced by the UI; ensure they exist and are wired to your CMS/Payload backend.

---

## Components and UX details

- Loading states
  - `app/events/loading.tsx` and `app/events/[eventId]/loading.tsx` render `LoadingScreen` during data fetch. The registration page also uses `LoadingScreen` while concurrently fetching event and form.
- Error states
  - Listing page shows an error banner if the list fetch fails.
  - Register page shows an inline error string.
- Confirmation UX
  - Title defaults to "Thank you for registering! See you soon." and content/buttons vary based on `confirmationType` and `redirect.url`.
- Early-bird
  - `event.early_bird_price` and `event.early_bird_end_date` are displayed on the details page. The form currently always uses `price` (string) for the payment amount and checks for free events via `price === "0.00"`.

---

## Environment and configuration

Required environment variables:

- `NEXT_PUBLIC_BASE_API_URL` — base URL for CMS/API (events, payments)
- `NEXT_PUBLIC_CMS_API_URL` — base URL for Payload CMS (forms and form submissions)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — public Razorpay key used by the Checkout widget

Payment integration requirements:

- Ensure the Razorpay Checkout script is available on pages that use `DynamicForm` (the code references `window.Razorpay`).
- The backend endpoints `cms/payment/order/` and `cms/payment/capture/` must be implemented to talk to Razorpay servers securely with your secret key.
- Ensure the Razorpay Checkout script is available on pages that use `DynamicForm` (the code references `window.Razorpay`).

Caching notes:

- The events list uses `cache: 'no-store'` to always get fresh data.
- The event detail fetch relies on default SSR fetch semantics.

---

## Edge cases and error handling

- Missing/invalid `NEXT_PUBLIC_BASE_API_URL` will cause event and payment fetch failures.
- Missing/invalid `NEXT_PUBLIC_CMS_API_URL` will cause form/form-submission failures.
- Missing/invalid `NEXT_PUBLIC_RAZORPAY_KEY_ID` will prevent payment initialization.
- If `event.form` is not set, `EventDetails` falls back to `external_event_link` (if present) or shows "Registrations opening soon".
- If the form endpoint fails, the registration page will show an error or "Form or Event not found".
- Network errors on any step surface as inline error text; consider adding retry UI if needed.

---

## Extending the flow

- Adding new fields to forms
  - Update `types/lexical-content.ts` if introducing new `blockType`s.
  - Extend the switch in `components/dynamic-form.tsx` to render the new field types and collect input values.
- Using early-bird price for payment
  - Wire a pricing rule in `DynamicForm` (e.g., if current date ≤ `early_bird_end_date` then use `earlyBirdPrice`); currently only `price` is used for `amount`.
- Additional confirmation actions
  - `EventRegistrationConfirmation` supports showing a WhatsApp CTA; you can add more CTAs or redirect behaviors based on form config.

---

## Quick reference (files and symbols)

- Listing: `app/events/page.tsx` (`EventCard`, `EventsHeader`)
- Detail: `app/events/[eventId]/page.tsx` (`generateMetadata`, `getEvent`, `EventDetails`)
- Register: `app/events/[eventId]/[formId]/page.tsx` (`DynamicForm`, `EventRegistrationConfirmation`)
- Components: `components/events/*`, `components/dynamic-form.tsx`
- Types: `types/cms-event.ts`, `types/lexical-content.ts`, `types/payload-cms/form-submission.ts`
- Utils: `utils/date-formatters.ts`, `utils/time-formatters.ts`, `utils/format-lexical-content.ts`, `utils/lexical-converters.tsx`

---

## Sequence summaries

- Free event
  1. User → fill form → submit
  2. UI → POST `/api/form-submissions`
  3. UI → show confirmation (message or WhatsApp CTA)

- Paid event
  1. User → fill form → submit
  2. UI → POST `/api/form-submissions`
  3. UI → POST `cms/payment/order/` → open Razorpay
  4. Razorpay success → UI → POST `cms/payment/capture/`
  5. UI → show confirmation (message or WhatsApp CTA)

---
