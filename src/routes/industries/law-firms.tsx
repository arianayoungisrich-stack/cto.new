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

export const Route = createFileRoute("/industries/law-firms")({
  loader: async () => {
    const businessName = await getBusinessName();
    incrementPageView({ data: "/industries/law-firms" }).catch(() => {});
    return businessName;
  },
  head: () => ({
    meta: [
      { title: "AI-Powered Client Intake for Law Firms | Reply AI" },
      { name: "description", content: "Qualify legal leads 10x faster with AI-powered intake automation. Capture after-hours calls, screen prospects instantly, and book consultations 24/7." },
    ],
  }),
  component: LawFirmsPage,
});

function LawFirmsPage() {
  const businessName = Route.useLoaderData();

  return (
    <IndustryPage
      businessName={businessName}
      industry="Law Firms"
      headline="Never Miss a Potential Client Again."
      subheadline="Reply AI handles initial intake automatically — screening callers, qualifying cases, and booking consultations — even when your office is closed."
      painPoints={[
        {
          title: "Legal emergencies don't wait",
          description: "Missed calls = lost clients. Most legal issues arise after business hours.",
        },
        {
          title: "Manual intake is slow",
          description: "Spending 15+ minutes per call to determine case viability wastes billable hours.",
        },
        {
          title: "Speed-to-lead advantage",
          description: "The first firm to respond usually gets the retainer. AI gives you the edge.",
        },
      ]}
      solutions={[
        {
          title: "24/7 Intelligent Intake",
          description: "AI screens practice area, location, and urgency instantly.",
          icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
        },
        {
          title: "Consultation Booking",
          description: "Qualified leads book directly into your calendar without human intervention.",
          icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
        },
        {
          title: "Prospect Screening",
          description: "Instantly filter out non-viable inquiries based on your criteria.",
          icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>,
        },
      ]}
      testimonial={{
        quote: "Reply AI has completely streamlined our initial client intake. We're responding to leads in seconds, and our consultation show-rate has never been higher.",
        author: "Robert Vance",
        role: "Partner, Vance & Associates Law",
      }}
    />
  );
}
