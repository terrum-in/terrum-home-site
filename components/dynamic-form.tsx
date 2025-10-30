"use client";

import { FormData } from "@/types/lexical-content";
import { useState, ChangeEvent, FormEvent } from "react";
import { FormSubmissionResponse } from "@/types/payload-cms/form-submission";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { jsxConverters } from "@/utils/lexical-converters";

const DynamicForm: React.FC<{
  form: FormData;
  price: string;
  earlyBirdPrice: string;
  eventId: number;
  onConfirmation: (
    confirmationType: string,
    confirmationMessage?: string | null,
    redirectUrl?: string | null
  ) => void;
}> = ({ form, price, earlyBirdPrice, eventId, onConfirmation }) => { 
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/payment/order/`,
        {
          method: "POST",
          body: JSON.stringify({
            amount: Number(price),
            currency: "INR",
            form_submission_id: formSubmissionId,
            event_id: eventId,
            form_id: form.id,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const order = await response.json();

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
          // Send POST request to capture payment
          try {
            const captureResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_API_URL}/cms/payment/capture/`,
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

            // Use the new onConfirmation prop instead of dialog
            onConfirmation(confirmationType, confirmationMessage, redirectUrl);
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
      form: form.id,
      submissionData,
    };

    try {      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_API_URL}/api/form-submissions`,
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
      if (price !== "0.00") {
        await handlePayment(
          result.doc.form.confirmationType,
          result.doc.form.confirmationMessage,
          result.doc.form.redirect?.url,
          result.doc.id
        );
      } else {
        // Use the new onConfirmation prop instead of dialog
        onConfirmation(
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
    <div className="min-h-screen" style={{ backgroundColor: "#7D4546" }}>
      <main className="container mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {form.title}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => {
              switch (field.blockType) {
                case "message":
                  return (
                    <div
                      key={field.id}
                      className="prose max-w-none bg-gray-50 p-4 rounded-lg"
                    >
                      {field.message ? (
                        <RichText
                          data={field.message}
                          converters={jsxConverters}
                        />
                      ) : null}
                    </div>
                  );

                case "select":
                  return (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <select
                        name={field.name}
                        required={field.required}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#7D4546] focus:border-transparent"
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
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name={field.name}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#7D4546] focus:ring-[#7D4546]"
                      />
                      <label className="text-sm text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  );

                default:
                  return (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type={field.blockType}
                        name={field.name}
                        required={field.required}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#7D4546] focus:border-transparent"
                      />
                    </div>
                  );
              }
            })}

            <div className="text-center pt-6">
              <button
                type="submit"
                className="inline-block bg-[#7D4546] hover:bg-[#6a3a3b] text-white px-8 py-2 text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                {price === "0.00" ? "Submit" : "Continue to payment"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DynamicForm;
