import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-block hover:underline">← Back to Home</Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-slate prose-p:text-slate-600">
          <p className="mb-4">Last Updated: June 29, 2026</p>
          <p className="mb-4">Your privacy is important to us. It is Reply AI's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">2. Use of Information</h2>
          <p className="mb-4">We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">3. Disclosure to Third Parties</h2>
          <p className="mb-4">We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">4. Contact Us</h2>
          <p className="mb-4">Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
        </div>
      </div>
    </div>
  );
}
