import { useState } from "react";
import { submitContact } from "../utils/api";

export function ContactForm() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const result = await submitContact({ data });
      if (result.success) {
        setFormStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setFormStatus("error");
      }
    } catch (err) {
      setFormStatus("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input name="name" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <input name="business" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Acme Inc." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input name="email" type="email" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input name="phone" type="tel" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea name="message" rows={4} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Tell us about your business goals..." />
        </div>
        <button 
          type="submit" 
          disabled={formStatus === 'submitting'}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {formStatus === 'submitting' ? 'Sending...' : 'Request Free Consultation'}
        </button>
        {formStatus === 'success' && <p className="text-green-600 font-medium text-center">Thanks! We'll be in touch shortly.</p>}
        {formStatus === 'error' && <p className="text-red-600 font-medium text-center">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
}
