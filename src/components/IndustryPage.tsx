import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { ContactForm } from "./ContactForm";

interface IndustryPageProps {
  businessName: string;
  industry: string;
  headline: string;
  subheadline: string;
  painPoints: { title: string; description: string }[];
  solutions: { title: string; description: string; icon: React.ReactNode }[];
  testimonial: { quote: string; author: string; role: string };
}

export function IndustryPage({
  businessName,
  industry,
  headline,
  subheadline,
  painPoints,
  solutions,
  testimonial,
}: IndustryPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <Navbar businessName={businessName} />

      {/* Hero */}
      <section className="pt-20 pb-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6">
                Reply AI for {industry}
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                {headline}
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                {subheadline}
              </p>
              <a href="#contact" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Get a Free Consultation
              </a>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  AI Lead Assistant Active
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none mr-12 text-sm text-slate-600">
                    "Hi! I'm looking for a {industry.toLowerCase()} service tomorrow morning. Do you have any openings?"
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none ml-12 text-sm text-white font-medium">
                    "Hello! Yes, we have an opening at 9:00 AM and 11:30 AM tomorrow. Would you like to book one of those?"
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none mr-12 text-sm text-slate-600">
                    "9:00 AM works great, thanks!"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why {industry} Businesses Lose Revenue</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {painPoints.map((point, i) => (
              <div key={i} className="p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-4 text-slate-900">{point.title}</h3>
                <p className="text-slate-600 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI Solutions Tailored for You</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((sol, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  {sol.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{sol.title}</h3>
                <p className="text-slate-600">{sol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center text-indigo-600 mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
          </div>
          <p className="text-3xl font-medium text-slate-900 italic mb-8">"{testimonial.quote}"</p>
          <div>
            <div className="font-bold text-xl">{testimonial.author}</div>
            <div className="text-slate-500">{testimonial.role}</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Capture More {industry} Leads Today</h2>
              <p className="text-slate-400 text-lg mb-8">
                Stop losing customers to the shop down the street. Let AI handle your follow-up so you can focus on the job.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-white">Live in 14 days or less</span>
                </div>
                <div className="flex items-center gap-4 text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-white">Seamless CRM integration</span>
                </div>
                <div className="flex items-center gap-4 text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-white">Managed service — we do the work</span>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-lg font-bold text-white">{businessName}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <div className="text-sm">
              Built with <a href="https://cto.new" className="underline hover:text-white">cto.new</a>
            </div>
          </div>
          <div className="mt-8 text-xs">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
