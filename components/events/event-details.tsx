import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@/types/cms-event";
import { formatDate, formatDateRange } from "@/utils/date-formatters";
import { formatTime } from "@/utils/time-formatters";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { jsxConverters } from "@/utils/lexical-converters";

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  // Build location string from available fields and handle commas
  const locationParts = [event.venue, event.city, event.state]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  const location = locationParts.join(", ");

  // Determine registration behavior
  const hasForm =
    event.form !== null && event.form !== undefined && Number(event.form) > 0;
  const externalLink = (event.external_event_link ?? "").trim();
  const hasExternalLink = externalLink.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#7d4546" }}>
      {/* Banner Image */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
        <Image
          src={
            event.image?.presigned_url ||
            "/placeholder.svg?height=500&width=1200"
          }
          alt={event.image?.alt || "Event Banner"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Event Content */}
      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 -mt-16 md:-mt-24 relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            {event.is_hosted_by_terrum && (
              <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                Hosted By Terrum
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span>{formatDateRange(event.start_date, event.end_date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <span>
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </span>
              </div>
              {!event.is_online && location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  {event.google_maps_link ? (
                    <a
                      href={event.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {location}
                    </a>
                  ) : (
                    <span>{location}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3">Event Description</h2>
            <RichText data={event.description} converters={jsxConverters} />
          </div>

          {event.agenda_blocks?.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
              <div className="space-y-4">
                {event.agenda_blocks.map((block) => (
                  <div key={block.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium">
                      {block.time}: {block.title}
                    </h3>
                    <p className="text-sm text-gray-600">{block.description}</p>
                    {block.speaker && (
                      <p className="text-sm text-gray-500">
                        Speaker: {block.speaker}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Button */}
          <div className="text-center">
            {hasForm ? (
              <a
                href={`/events/${event.event_uuid}/${event.form}`}
                className="inline-block bg-[#7D4546] hover:bg-[#6a3a3b] text-white px-8 py-2 text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                Register Now
              </a>
            ) : hasExternalLink ? (
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#7D4546] hover:bg-[#6a3a3b] text-white px-8 py-2 text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                Go to event registrations
              </a>
            ) : (
              <p className="text-lg font-medium text-gray-600">
                Registrations opening soon
              </p>
            )}
            {event.early_bird_price && event.early_bird_end_date && (
              <p className="mt-3 text-sm text-gray-500">
                Early bird registration ends on{" "}
                {formatDate(event.early_bird_end_date)}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
