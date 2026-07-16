import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IndustryPage } from "../../components/IndustryPage";
import { incrementPageView } from "../../utils/api";
import { getBusinessName } from "../../utils/db";

const getBusinessNameFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBusinessName();
});

export const Route = createFileRoute("/industries/plumbers")({
  loader: async () => {
    const businessName = await getBusinessNameFn();
    incrementPageView({ data: "/industries/plumbers" }).catch(() => {});
    return businessName;
  },
  head: () => ({
    meta: [
      { title: "AI Lead Generation for Plumbers | Reply AI" },
      { name: "description", content: "Never miss another emergency plumbing call. Reply AI captures every missed call, texts back instantly, and books appointments automatically — 24/7." },
    ],
  }),
  component: PlumbersPage,
});

function PlumbersPage() {
  const businessName = Route.useLoaderData();

  return (
    <IndustryPage
      businessName={businessName}
      industry="Plumbing"
      headline="Never Miss Another Emergency Plumbing Call."
      subheadline="Reply AI answers every missed call with an instant text, qualifies the lead, and books the job — even when you're on another site."
      painPoints={[
        {
          title: "Missed calls = lost revenue",
          description: "60% of callers won't leave a voicemail. They just call your competitor.",
        },
        {
          title: "Slow response = lost jobs",
          description: "After 5 minutes, your chance of closing drops by 80%.",
        },
        {
          title: "After-hours = blind spot",
          description: "Burst pipes happen at midnight. Without 24/7 coverage, you're losing emergency jobs.",
        },
      ]}
      solutions={[
        {
          title: "Missed-Call Text-Back",
          description: "Every call gets a response within 5 seconds",
          icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        },
        {
          title: "24/7 AI Chat",
          description: "Answer inquiries at 2 AM, weekends, holidays",
          icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
        },
        {
          title: "Smart Qualification",
          description: "Emergency calls get priority routing",
          icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>,
        },
      ]}
      testimonial={{
        quote: "The missed-call text-back is a game changer. We've saved dozens of leads that otherwise would've gone to competitors.",
        author: "Mike Thompson",
        role: "Thompson HVAC",
      }}
    />
  );
}
