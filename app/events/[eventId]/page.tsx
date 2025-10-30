import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { lexicalJsonToPlainText } from "@/utils/format-lexical-content";
import { Event } from "@/types/cms-event";
import EventsHeader from "@/components/events/events-header";
import EventDetails from "@/components/events/event-details";

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

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const eventId = (await params).eventId;

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
      <EventDetails
        event={event}
      />
    </>
  );
}
