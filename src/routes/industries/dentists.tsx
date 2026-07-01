import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { IndustryPage } from "../../components/IndustryPage";
import { incrementPageView } from "../../utils/api";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "Reply AI";
  } catch {
    return "Reply AI";
  }
});

export const Route = createFileRoute("/industries/dentists")({
  loader: async () => {
    const businessName = await getBusinessName();
    incrementPageView({ data: "/industries/dentists" }).catch(() => {});
    return businessName;
  },
  head: () => ({
    meta: [
      { title: "AI-Powered Patient Booking for Dentists | Reply AI" },
      { name: "description", content: "Never miss a new patient call again. Reply AI captures every missed call, books appointments 24/7, and reduces no-shows with automated reminders." },
    ],
  }),
  component: DentistsPage,
});

function DentistsPage() {
  const businessName = Route.useLoaderData();

  return (
    <IndustryPage
      businessName={businessName}
      industry="Dentists"
      headline="Fill Your Schedule, Even When You're Chairside."
      subheadline="Reply AI answers every missed call with an instant text, qualifies new patients, and books appointments — so your front desk stays focused on patients, not the phone."
      painPoints={[
        {
          title: "Missed calls = empty chairs",
          description: "Every call you miss is a new patient who books down the street.",
        },
        {
          title: "Limited front desk hours",
          description: "After-hours callers leave voicemails that get returned too late.",
        },
        {
          title: "No-show rate",
          description: "25-30% of dental appointments no-show without reminders.",
        },
      ]}
      solutions={[
        {
          title: "Instant Text-Back",
          description: "Call missed? AI sends an instant text to start the booking process.",
          icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        },
        {
          title: "24/7 Patient Coordinator",
          description: "AI qualifies new vs. existing patients and offers slots anytime.",
          icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
        },
        {
          title: "Automated Reminders",
          description: "Reduce no-shows with smart follow-up and confirmation texts.",
          icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>,
        },
      ]}
      testimonial={{
        quote: "Our new patient bookings have increased by 20% since we let the AI handle the initial website inquiries. It's like having an extra staff member.",
        author: "Dr. James Lee",
        role: "Lead Dentist, Bright Smile Dental",
      }}
    />
  );
}
