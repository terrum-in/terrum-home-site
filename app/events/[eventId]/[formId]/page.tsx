"use client";

import DynamicForm from "@/components/dynamic-form";
import { Event } from "@/types/cms-event";
import { FormData } from "@/types/lexical-content";
import EventsHeader from "@/components/events/events-header";
import { useEffect, useState } from "react";
import { use } from "react";
import { EventRegistrationConfirmation } from "@/components/events/event-registration-confirmation";
import LoadingScreen from "@/components/loading/loading-screen";

export default function EventRegisterPage({
  params: paramsPromise,
}: {
  params: Promise<{ eventId: string; formId: string }>;
}) {
  const params = use(paramsPromise);
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState<{
    title: string;
    description?: string;
    showWhatsAppButton?: boolean;
    redirectUrl?: string | null;
  }>({
    title: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventData, formData] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/events/?event_uuid=${params.eventId}`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch event");
            return res.json();
          }),
          fetch(`http://localhost:3000/api/forms/${params.formId}`).then(
            (res) => {
              if (!res.ok) throw new Error("Failed to fetch form");
              return res.json();
            }
          ),
        ]);

        setEvent(eventData);
        setForm(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.eventId, params.formId]);

  const handleConfirmation = (
    confirmationType: string,
    confirmationMessage?: string | null,
    redirectUrl?: string | null
  ) => {
    if (confirmationType === "message" && confirmationMessage) {
      setConfirmationProps({
        title: "Thank you for registering! See you soon.",
        description: confirmationMessage,
      });
    } else if (confirmationType === "redirect") {
      setConfirmationProps({
        title: "Thank you for registering! See you soon.",
        description:
          "Join the WhatsApp community to continue being part of the event, it is mandatory to join the WhatsApp community, to keep track",
        showWhatsAppButton: true,
        redirectUrl,
      });
    }
    setShowConfirmation(true);
  };

  if (isLoading) {
    return <LoadingScreen/>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (showConfirmation) {
    return (
      <>
        <EventsHeader />
        <EventRegistrationConfirmation {...confirmationProps} />
      </>
    );
  }

  return event && form ? (
    <>
      <EventsHeader />
      <DynamicForm
        form={form}
        price={event.price}
        eventId={event.id}
        onConfirmation={handleConfirmation}
      />
    </>
  ) : (
    <div>Form or Event not found</div>
  );
}
