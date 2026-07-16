import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { IndustryPage } from "../../components/IndustryPage";
import { incrementPageView } from "../../utils/api";
import { getBusinessName } from "../../utils/db";

const getBusinessNameFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBusinessName();
});

export const Route = createFileRoute("/industries/hvac")({
  loader: async () => {
    const businessName = await getBusinessNameFn();
    incrementPageView({ data: "/industries/hvac" }).catch(() => {});
    return businessName;
  },
  head: () => ({
    meta: [
      { title: "AI Lead Capture for HVAC Businesses | Reply AI" },
      { name: "description", content: "Never miss another HVAC service call. Reply AI responds to every missed call instantly, qualifies leads, and books appointments 24/7/365." },
    ],
  }),
  component: HVACPage,
});

function HVACPage() {
  const businessName = Route.useLoaderData();

  return (
    <IndustryPage
      businessName={businessName}
      industry="HVAC"
      headline="Never Miss Another HVAC Service Call."
      subheadline="Peak season, after hours, holiday weekend — Reply AI captures every call with instant text-back, qualification, and booking. Your techs stay focused on the job."
      painPoints={[
        {
          title: "Peak season volume",
          description: "Summer heatwaves = 3-5x call volume, but you have the same number of hands.",
        },
        {
          title: "After-hours callers",
          description: "Customers who call at 9 PM won't wait until morning — they call your competitor.",
        },
        {
          title: "Lost opportunities",
          description: "Every missed call is a customer who might never call you back.",
        },
      ]}
      solutions={[
        {
          title: "Missed-Call Text-Back",
          description: "Every call answered within seconds, even during heatwaves",
          icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        },
        {
          title: "Emergency Detection",
          description: "AI identifies urgent vs. routine and routes accordingly",
          icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
        },
        {
          title: "Peak Season Scaling",
          description: "Handles unlimited concurrent calls effortlessly",
          icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>,
        },
      ]}
      testimonial={{
        quote: "During our busy summer season, we were missing 30+ calls a week. Reply AI captures every single one now. Best investment we've made.",
        author: "Sarah Miller",
        role: "Manager, Miller Air Conditioning",
      }}
    />
  );
}
