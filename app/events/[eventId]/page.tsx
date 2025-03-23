import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import {
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  ClockIcon,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import renderLexicalContent from "@/utils/render-lexical-content";
import { lexicalJsonToPlainText } from "@/utils/format-lexical-content";
import { Event } from "@/types/cms-event";
import EventsHeader from "@/components/events/EventsHeader";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const eventId = (await params).eventId;

  try {
    const event = await getEvent(eventId);

    const plainTextDescription = lexicalJsonToPlainText(event.description);

    // Truncate if needed
    const cleanDescription =
      plainTextDescription.slice(0, 300) +
      (plainTextDescription.length > 300 ? "..." : "");

    const keywords: string[] = [
      event.name,
      event.venue?.trim() || null,
      event.city?.trim() || null,
      "Terrum",
      "Terrum Events",
      "Sustainability",
      "Sustainable Living",
      "Sustainable Events",
      "Sustainable Activities",
      "Climate Action",
      "Climate Change",
      "Environment",
      "Nature",
      "Biodiversity",
      "Eco-friendly",
      "Eco-conscious",
      "Eco-conscious events",
      "Eco-conscious activities",
      "Community",
      "Community events",
      "Community activities",
      "Community engagement",
      "Community building",
      "Renuka",
      "Renuka Pooja",
      "Abhishek",
      "Abhishek AN",
    ].filter((keyword): keyword is string => Boolean(keyword));

    return {
      title: `${event.name}`,
      description: cleanDescription,
      keywords: keywords,
      icons: {
        icon: "/terrum_circle_64x64.ico",
        apple: "/terrum_circle_64x64.png",
      },
      openGraph: {
        title: `${event.name}`,
        locale: "en_US",
        description: cleanDescription,
        url: `https://terrum.in/events/${eventId}`,
        type: "website",
        images: event.image?.presigned_url
          ? [
              {
                url: event.image.presigned_url,
                width: 1200,
                height: 630,
                alt: event.name,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        site: "@terrum_in",
        title: `${event.name}`,
        description: cleanDescription,
        images: event.image?.presigned_url ? [event.image.presigned_url] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Event Details - Terrum",
      description: "View details about this Terrum event",
    };
  }
}

// Fetch event data from the API
async function getEvent(eventId: string): Promise<Event> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid=${eventId}`
  );

  if (!res.ok) {
    console.error("Failed to fetch event:", res.statusText);
  }

  return res.json();
}

// Function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Add this function after the formatDate function
function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Compare the dates (ignoring time)
  const isSameDate = start.toDateString() === end.toDateString();

  if (isSameDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Add this function after the formatDate function
function formatTime(timeString: string) {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Get the event ID from the URL
  const eventId = (await params).eventId;

  // Fetch the event data
  let event: Event;

  try {
    event = await getEvent(eventId);
  } catch (error) {
    console.error("Error fetching event:", error);
    notFound();
  }

  return (
    <>
      <EventsHeader />
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
                  <span>
                    {formatDateRange(event.start_date, event.end_date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span>
                    {formatTime(event.start_time)} -{" "}
                    {formatTime(event.end_time)}
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
                    Opening ceremony, keynote speeches, and introductory
                    workshops
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
    </>
  );
}
