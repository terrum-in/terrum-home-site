import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@/types/cms-event";
import renderLexicalContent from "@/utils/render-lexical-content";

interface EventDetailsProps {
  event: Event;
  formatDateRange: (startDate: string, endDate: string) => string;
  formatTime: (timeString: string) => string;
}

export default function EventDetails({
  event,
  formatDateRange,
  formatTime,
}: EventDetailsProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#7D4546" }}>
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
            <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
              Hosted By Terrum
            </span>
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
              {!event.is_online && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <span>
                    {event.venue}
                    {event.city && `, ${event.city}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3">Event Description</h2>
            {renderLexicalContent(event.description.root.children)}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Day 1: March 25</h3>
                <p className="text-sm text-gray-600">
                  Opening ceremony, keynote speeches, and introductory workshops
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Day 2: March 26</h3>
                <p className="text-sm text-gray-600">
                  Technical sessions, panel discussions, and networking lunch
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Day 3: March 27</h3>
                <p className="text-sm text-gray-600">
                  Advanced workshops, career fair, and closing ceremony
                </p>
              </div>
            </div>
          </div>

          {/* Registration Button */}
          <div className="text-center">
            <a
              href={`/events/${event.event_uuid}/${event.form}`}
              className="inline-block bg-[#7D4546] hover:bg-[#6a3a3b] text-white px-8 py-2 text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
            >
              Register Now
            </a>
            <p className="mt-3 text-sm text-gray-500">
              Early bird registration ends January 15, 2025
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
