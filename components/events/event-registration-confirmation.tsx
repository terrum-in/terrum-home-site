import { Button } from "@/components/ui/button";

interface EventRegistrationConfirmationProps {
  title: string;
  description?: string;
  showWhatsAppButton?: boolean;
  redirectUrl?: string | null;
}

export function EventRegistrationConfirmation({
  title,
  description,
  showWhatsAppButton,
  redirectUrl,
}: EventRegistrationConfirmationProps) {
  return (
    <div className="my-32 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
        {showWhatsAppButton && redirectUrl && (
          <Button
            className="w-full"
            onClick={() => window.open(redirectUrl, "_blank")}
          >
            Join WhatsApp Community
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => (window.location.href = "/events")}
        >
          Check Out Other Events
        </Button>
      </div>
    </div>
  );
}
