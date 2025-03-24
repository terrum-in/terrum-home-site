import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  showWhatsAppButton?: boolean;
  redirectUrl?: string | null;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  showWhatsAppButton,
  redirectUrl,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {showWhatsAppButton && redirectUrl && (
          <Button
            className="w-full"
            onClick={() => window.open(redirectUrl, "_blank")}
          >
            Join WhatsApp Community
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
