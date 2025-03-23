"use client";

import { FormData } from "@/types/lexical-content";
import renderLexicalContent from "@/utils/render-lexical-content";
import { useState, ChangeEvent, FormEvent } from "react";
import Razorpay from "razorpay";
import { FormSubmissionResponse } from "@/types/payload-cms/form-submission";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

const DynamicForm: React.FC<{
  form: FormData;
  price: number;
  eventId: number;
}> = ({ form, price, eventId }) => {
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<{
    title: string;
    description?: string;
    showWhatsAppButton?: boolean;
    redirectUrl?: string | null;
  }>({
    title: "",
  });

  const openConfirmationDialog = (
    confirmationType: string,
    confirmationMessage?: string | null,
    redirectUrl?: string | null
  ) => {
    if (confirmationType === "message" && confirmationMessage) {
      setDialogProps({
        title: "Thank you for registering for the event! See you soon.",
        description: `${confirmationMessage}`,
      });
    } else if (confirmationType === "redirect") {
      setDialogProps({
        title: "Thank you for registering for the event! See you soon.",
        description:
          "Join the WhatsApp community to continue being part of the event, it is mandatory to join the WhatsApp community, to keep track",
        showWhatsAppButton: true,
        redirectUrl,
      });
    }
    setDialogOpen(true);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePayment = async (
    confirmationType: string,
    confirmationMessage?: string | null,
    redirectUrl?: string | null,
    formSubmissionId?: number
  ) => {
    try {
      const response = await fetch("http://localhost:8000/cms/payment/order/", {
        method: "POST",
        body: JSON.stringify({
          amount: price.toString(), // Convert number directly to string
          currency: "INR",
          form_submission_id: formSubmissionId,
          event_id: eventId,
          form_id: form.id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const order = await response.json();

      // Extract name, email, and contact from formData
      const name = formData["name"] as string;
      const email = formData["email"] as string;
      const contact = formData["contact"] as string;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Terrum",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response: any) {
          console.log(response);

          // Send POST request to capture payment
          try {
            const captureResponse = await fetch(
              "http://localhost:8000/cms/payment/capture/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                }),
              }
            );

            if (!captureResponse.ok) {
              throw new Error(`Capture Error: ${captureResponse.statusText}`);
            }

            console.log("Payment captured successfully");

            // Open the confirmation dialog after successful payment capture
            openConfirmationDialog(
              confirmationType,
              confirmationMessage,
              redirectUrl
            );
          } catch (error) {
            console.error("Payment capture failed:", error);
          }
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "All Payment Options",
                instruments: [
                  {
                    method: "upi",
                  },
                  {
                    method: "card",
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        prefill: {
          name,
          email,
          contact,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const submissionData = Object.entries(formData).map(([field, value]) => ({
      field,
      value,
    }));

    const payload = {
      form: form.id, // Assuming `form.id` contains the form identifier
      submissionData,
    };

    try {
      // First, submit the form data
      const response = await fetch(
        "http://localhost:3000/api/form-submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result: FormSubmissionResponse = await response.json();
      console.log("Form submitted successfully:", result);

      // After successful form submission, handle payment if price > 0
      if (price !== 0) {
        await handlePayment(
          result.doc.form.confirmationType,
          result.doc.form.confirmationMessage,
          result.doc.form.redirect?.url,
          result.doc.id
        );
      } else {
        // Open the confirmation dialog based on the form submission response
        openConfirmationDialog(
          result.doc.form.confirmationType,
          result.doc.form.confirmationMessage,
          result.doc.form.redirect?.url
        );
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-4 space-y-4 border rounded-lg shadow md:max-w-2xl lg:max-w-3xl my-8"
      >
        <h2 className="text-2xl font-bold">{form.title}</h2>

        {form.fields.map((field) => {
          switch (field.blockType) {
            case "message":
              return (
                <div key={field.id} className="p-4 bg-gray-100 rounded-md">
                  {field.message?.root?.children
                    ? renderLexicalContent(field.message.root.children)
                    : null}
                </div>
              );

            case "select":
              return (
                <div key={field.id} className="flex flex-col">
                  <label className="font-medium">{field.label}</label>
                  <select
                    name={field.name}
                    required={field.required}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );

            case "checkbox":
              return (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={field.name}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label className="text-gray-700">{field.label}</label>
                </div>
              );

            default:
              return (
                <div key={field.id} className="flex flex-col">
                  <label className="font-medium">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.blockType}
                    name={field.name}
                    required={field.required}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />
                </div>
              );
          }
        })}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto"
        >
          {price === 0 ? "Submit" : "Continue to payment"}
        </button>
      </form>

      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        {...dialogProps}
      />
    </>
  );
};

export default DynamicForm;
