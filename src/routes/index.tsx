import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { Navbar } from "../components/Navbar";
import { ContactForm } from "../components/ContactForm";
import { incrementPageView } from "../utils/api";

// Read business name
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

export const Route = createFileRoute("/")({
  loader: async () => {
    const businessName = await getBusinessName();
    // Non-blocking analytics increment
    incrementPageView({ data: "/" }).catch(() => {});
    return businessName;
  },
  head: (data) => ({
    meta: [
      { title: `Reply AI — AI-Powered Lead Conversion for Local Businesses` },
      { name: "description", content: "Stop losing leads. Reply AI helps local businesses capture every inquiry and book appointments automatically with AI-powered follow-up systems." },
      { property: "og:title", content: "Reply AI — AI-Powered Lead Follow-up" },
      { property: "og:description", content: "Convert every lead into a customer with automated AI responses, appointment booking, and missed-call text-back." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <Navbar businessName={businessName} />

      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
              Stop Losing 40% of Your Leads. <span className="text-indigo-600">Start Converting Every Inquiry.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Local businesses lose up to 40% of leads when they don't respond within 5 minutes. We fix that with AI that answers instantly and books appointments 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Get a Free Consultation
              </a>
              <a href="#services" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                See How It Works
              </a>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Grow</h2>
            <p className="text-slate-600">Automate your customer journey from first touch to booked appointment.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              title="AI Chatbot & Instant Reply"
              description="Never miss a message again. Our AI handles inquiries on your website 24/7."
              icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
            />
            <ServiceCard
              title="Smart Lead Qualification"
              description="Automatically qualify and route leads based on your specific business criteria."
              icon={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>}
            />
            <ServiceCard
              title="Automated Appointment Booking"
              description="Sync with your calendar and let clients book their own appointments without the back-and-forth."
              icon={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
            />
            <ServiceCard
              title="Missed-Call Text-Back"
              description="Automatically text back missed calls instantly to keep the conversation moving."
              icon={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />}
            />
            <ServiceCard
              title="Follow-Up Automation"
              description="Nurture every lead with personalized email and SMS sequences until they convert."
              icon={<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>}
            />
            <ServiceCard
              title="CRM & Analytics"
              description="Track every lead, conversation, and conversion in one unified dashboard."
              icon={<><path d="M3 3v18h18" /><path d="M18 9l-6 6-3-3-3 3" /></>}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Simple Process</h2>
            <p className="text-slate-600">How we get your AI systems up and running in days, not months.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <Step number="01" title="Discover & Plan" description="We analyze your current lead flow and design a custom AI strategy for your business." />
            <Step number="02" title="Build & Integrate" description="Our team builds your AI agents and integrates them seamlessly with your existing tools." />
            <Step number="03" title="Launch & Grow" description="We launch your systems and provide ongoing optimization to maximize your ROI." />
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Industries We Serve</h2>
            <p className="text-indigo-200">Tailored AI solutions for high-intent service businesses.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Plumbers', to: '/industries/plumbers' },
              { name: 'HVAC', to: '/industries/hvac' },
              { name: 'Dentists', to: '/industries/dentists' },
              { name: 'Law Firms', to: '/industries/law-firms' }
            ].map(industry => (
              <Link
                key={industry.name}
                to={industry.to}
                className="bg-indigo-800/50 p-6 rounded-xl border border-indigo-700 text-center hover:bg-indigo-800 transition-colors block"
              >
                <span className="font-semibold text-lg">{industry.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-slate-600">Investment that pays for itself in captured leads.</p>
          </div>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-2">Setup & Launch</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-6">$1,500 – $3,500</div>
              <ul className="space-y-3 text-slate-600 mb-8 text-sm">
                <li className="flex gap-2">✓ Discovery & Strategy</li>
                <li className="flex gap-2">✓ Custom AI Training</li>
                <li className="flex gap-2">✓ CRM Integration</li>
                <li className="flex gap-2">✓ Workflow Automation</li>
              </ul>
            </div>
            <div className="bg-indigo-600 p-8 rounded-2xl shadow-xl text-white transform md:scale-105">
              <h3 className="text-xl font-bold mb-2">Managed AI Service</h3>
              <div className="text-4xl font-bold mb-6">$500 – $1,500<span className="text-lg font-normal text-indigo-200">/mo</span></div>
              <ul className="space-y-3 text-indigo-100 mb-8 text-sm">
                <li className="flex gap-2">✓ Ongoing Optimization</li>
                <li className="flex gap-2">✓ Priority Support</li>
                <li className="flex gap-2">✓ Weekly Reporting</li>
                <li className="flex gap-2">✓ Unlimited Lead Processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Case Studies</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We are currently onboarding our first cohort of local service businesses. Real client success stories and performance data will be published here as they become available.
          </p>
          <div className="mt-8 inline-block px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium">
            Case studies coming soon
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about our AI lead conversion systems.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="How long does it take to set up?"
              answer="We typically have your AI systems live and capturing leads within 14 days of our strategy session."
            />
            <FAQItem
              question="Do I need any technical skills?"
              answer="No technical skills required. We handle the full build, integration, and ongoing optimization for you."
            />
            <FAQItem
              question="What if I already have a CRM?"
              answer="We integrate seamlessly with most major CRMs. If yours is custom, our team can build a direct integration via API."
            />
            <FAQItem
              question="How is this different from basic chatbots?"
              answer="Traditional chatbots follow rigid scripts. Our AI is trained on your specific business data, handles complex questions, and can escalate to a human when needed."
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Ready to scale your business with AI?</h2>
              <p className="text-slate-400 text-lg mb-8">
                Book a free consultation call and we'll show you exactly how much revenue you're leaving on the table.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span>hello@replyai.agency</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-lg font-bold text-white">{businessName}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
            <div className="text-sm text-slate-600">
              Converting leads into customers automatically.
            </div>
          </div>
          <div className="mt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
      <h3 className="font-bold text-lg mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  );
}

function ServiceCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="text-6xl font-black text-slate-100 absolute -top-8 -left-4 z-0">{number}</div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function Testimonial({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl">
      <div className="flex text-indigo-600 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        ))}
      </div>
      <p className="text-slate-700 italic mb-6">"{quote}"</p>
      <div>
        <div className="font-bold text-slate-900">{author}</div>
        <div className="text-slate-500 text-sm">{role}</div>
      </div>
    </div>
  );
}
