import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import {
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  ClockIcon,
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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="overflow-hidden">
          {event.image && (
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={event.image.presigned_url || "/placeholder.svg"}
                alt={event.image.alt || event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl">
                  {event.name}
                </CardTitle>
                {event.is_online ? (
                  <Badge variant="outline" className="mt-2">
                    Online Event
                  </Badge>
                ) : (
                  event.venue && (
                    <CardDescription className="flex items-center mt-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {event.venue}
                      {event.city && `, ${event.city}`}
                    </CardDescription>
                  )
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {formatDateRange(event.start_date, event.end_date)}
                  </span>
                </div>

                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>
                    {formatTime(event.start_time)} -{" "}
                    {formatTime(event.end_time)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              {renderLexicalContent(event.description.root.children)}
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4">
              {event.google_form_link && (
                <Button className="flex items-center gap-2" asChild>
                  <a
                    href={event.google_form_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              )}

              {event.payment_link && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a
                    href={event.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Payment
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              )}

              {event.google_maps_link && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a
                    href={event.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Map
                    <MapPinIcon className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <a
                  href={`/events/${event.event_uuid}/${event.form}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Form
                  <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
