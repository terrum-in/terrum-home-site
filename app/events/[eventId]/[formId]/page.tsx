import DynamicForm from "@/components/dynamic-form";
import { Event } from "@/types/cms-event";
import { FormData } from "@/types/lexical-content";
import { notFound } from "next/navigation";
import EventsHeader from "@/components/events/events-header";

const fetchForm = async (formID: string): Promise<FormData | null> => {
  try {
    const response = await fetch(`http://localhost:3000/api/forms/${formID}`);
    if (!response.ok) {
      throw new Error("Failed to fetch form data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching form data:", error);
    return null;
  }
};

async function getEvent(eventId: string): Promise<Event> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid=${eventId}`
  );

  if (!res.ok) {
    console.error("Failed to fetch event:", res.statusText);
  }

  return res.json();
}

export default async function EventRegisterPage({
  params: rawParams,
}: {
  params: Promise<{ eventId: string; formId: string }>;
}) {
  const params = await rawParams;

  const [event, form] = await Promise.all([
    getEvent(params.eventId),
    fetchForm(params.formId),
  ]);

  return event && form ? (
    <>
      <EventsHeader />
      <DynamicForm form={form} price={event.price} eventId={event.id} />
    </>
  ) : (
    <div>Form or Event not found</div>
  );
}
