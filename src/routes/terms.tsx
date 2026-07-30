import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link to="/" className="text-indigo-600 font-bold mb-8 inline-block hover:underline">← Back to Home</Link>
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate prose-p:text-slate-600">
          <p className="mb-4">Last Updated: June 29, 2026</p>
          <h2 className="text-xl font-bold mt-8 mb-4">1. Terms</h2>
          <p className="mb-4">By accessing the website at Reply AI, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">2. Use License</h2>
          <p className="mb-4">Permission is granted to temporarily download one copy of the materials (information or software) on Reply AI's website for personal, non-commercial transitory viewing only.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">3. Disclaimer</h2>
          <p className="mb-4">The materials on Reply AI's website are provided on an 'as is' basis. Reply AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          <h2 className="text-xl font-bold mt-8 mb-4">4. Limitations</h2>
          <p className="mb-4">In no event shall Reply AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Reply AI's website.</p>
        </div>
      </div>
    </div>
  );
}
