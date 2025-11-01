import { formatTime } from "@/utils/time-formatters";
import { Event } from "@/types/cms-event";
import { formatDateRange } from "@/utils/date-formatters";
import { Calendar, Clock, MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
  tall?: boolean;
}

export default function EventCard({ event, tall = false }: EventCardProps) {
  // Build location string from available fields and handle commas
  const locationParts = [event.venue, event.city, event.state]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  const location = locationParts.join(", ");

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl h-[400px] ${
        tall ? "md:h-[500px]" : "md:h-[400px]"
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
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{location}</span>
            </div>
          )}

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
