import { Event } from "@/types/cms-event";
import EventsHeader from "@/components/events/events-header";
import EventCard from "@/components/events/event-card";

export default async function EventsPage() {
  let events: Event[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/events/`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    events = await response.json();
  } catch (err) {
    error = err instanceof Error ? err.message : "An error occurred";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <EventsHeader />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exciting workshops, meetups, and conferences hosted by
              Terrum. Join us to learn, connect, and grow together.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center text-gray-600">
              No events currently scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={index % 3 === 1 ? "md:translate-y-12" : ""}
                >
                  <EventCard event={event} tall={index % 3 === 1} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
