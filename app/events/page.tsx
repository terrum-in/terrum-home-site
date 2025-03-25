import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@/types/cms-event";
import { formatDateRange } from "@/utils/date-formatters";
import { formatTime } from "@/utils/time-formatters";
import EventsHeader from "@/components/events/events-header";

interface EventCardProps {
  event: Event;
  tall?: boolean;
}

function EventCard({ event, tall = false }: EventCardProps) {
  return (
    <div
      className={`relative group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
        tall ? "h-[500px]" : "h-[400px]"
      }`}
    >
      <a
        href={`/events/${event.event_uuid}`}
        className="absolute inset-0 z-10"
      />
      <div className="absolute inset-0">
        <img
          src={event.image.presigned_url}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-3">{event.name}</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {event.venue}, {event.locality}, {event.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {formatDateRange(event.start_date, event.end_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EventsPage() {
  let events: Event[] = [];
  let error: string | null = null;

  try {
    const response = await fetch("http://localhost:8000/cms/events/", {
      cache: "no-store",
    });
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
